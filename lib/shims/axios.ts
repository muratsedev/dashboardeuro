type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ParamsValue = string | number | boolean | null | undefined;

export interface AxiosRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, ParamsValue>;
  timeout?: number;
  withCredentials?: boolean;
  validateStatus?: (status: number) => boolean;
  maxContentLength?: number;
  maxBodyLength?: number;
  body?: BodyInit | null;
  data?: unknown;
}

export interface AxiosResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  config: AxiosRequestConfig & { url?: string; method?: Method };
}

export interface AxiosError<T = unknown> extends Error {
  config: AxiosRequestConfig & { url?: string; method?: Method };
  response?: AxiosResponse<T>;
  isAxiosError: true;
}

type RequestConfig = AxiosRequestConfig & { url?: string; method?: Method };
type RequestFulfilled = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type RequestRejected = (error: unknown) => unknown;

type ResponseFulfilled = <T>(response: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>;
type ResponseRejected = (error: AxiosError) => unknown;

const buildUrl = (url: string, params?: Record<string, ParamsValue>) => {
  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  if (!query) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};

const isFormData = (value: unknown): value is FormData => {
  return typeof FormData !== 'undefined' && value instanceof FormData;
};

const normalizeHeaders = (headers?: HeadersInit) => {
  const result: Record<string, string> = {};

  new Headers(headers).forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

const createAxiosError = <T>(
  message: string,
  config: AxiosRequestConfig & { url?: string; method?: Method },
  response?: AxiosResponse<T>
): AxiosError<T> => {
  const error = new Error(message) as AxiosError<T>;
  error.name = 'AxiosError';
  error.config = config;
  error.response = response;
  error.isAxiosError = true;
  return error;
};

class AxiosInstance {
  private defaults: AxiosRequestConfig;

  private requestHandlers: Array<{
    onFulfilled?: RequestFulfilled;
    onRejected?: RequestRejected;
  }> = [];

  private responseHandlers: Array<{
    onFulfilled?: ResponseFulfilled;
    onRejected?: ResponseRejected;
  }> = [];

  public interceptors = {
    request: {
      use: (onFulfilled?: RequestFulfilled, onRejected?: RequestRejected) => {
        this.requestHandlers.push({ onFulfilled, onRejected });
        return this.requestHandlers.length - 1;
      },
    },
    response: {
      use: (onFulfilled?: ResponseFulfilled, onRejected?: ResponseRejected) => {
        this.responseHandlers.push({ onFulfilled, onRejected });
        return this.responseHandlers.length - 1;
      },
    },
  };

  constructor(defaults: AxiosRequestConfig = {}) {
    this.defaults = defaults;
  }

  async request<T>(method: Method, url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    let mergedConfig: RequestConfig = {
      ...this.defaults,
      ...config,
      headers: {
        ...(this.defaults.headers || {}),
        ...(config.headers || {}),
      },
      url,
      method,
    };

    // Apply request interceptors
    for (const handler of this.requestHandlers) {
      if (handler.onFulfilled) {
        try {
          mergedConfig = await handler.onFulfilled(mergedConfig);
        } catch (error) {
          if (handler.onRejected) await handler.onRejected(error);
          throw error;
        }
      }
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    const timeoutId = controller && mergedConfig.timeout
      ? setTimeout(() => controller.abort(), mergedConfig.timeout)
      : undefined;

    try {
      const payload = mergedConfig.data ?? mergedConfig.body;
      const headers = { ...(mergedConfig.headers || {}) };

      let body: BodyInit | undefined;
      if (payload !== undefined && payload !== null) {
        if (isFormData(payload)) {
          delete headers['Content-Type'];
          delete headers['content-type'];
          body = payload;
        } else if (typeof payload === 'string' || payload instanceof Blob || payload instanceof ArrayBuffer) {
          body = payload as BodyInit;
        } else {
          headers['Content-Type'] = headers['Content-Type'] || 'application/json';
          body = JSON.stringify(payload);
        }
      }

      const response = await fetch(buildUrl(url, mergedConfig.params), {
        method,
        headers,
        body,
        credentials: mergedConfig.withCredentials ? 'include' : 'same-origin',
        signal: controller?.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: T;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as T;
      }

      const axiosResponse: AxiosResponse<T> = {
        data,
        status: response.status,
        headers: normalizeHeaders(response.headers),
        config: mergedConfig,
      };

      const validateStatus = mergedConfig.validateStatus || ((status: number) => status >= 200 && status < 300);
      if (!validateStatus(response.status)) {
        throw createAxiosError(`Request failed with status code ${response.status}`, mergedConfig, axiosResponse);
      }

      let transformedResponse = axiosResponse;
      for (const handler of this.responseHandlers) {
        if (handler.onFulfilled) {
          transformedResponse = await handler.onFulfilled(transformedResponse) as AxiosResponse<T>;
        }
      }

      return transformedResponse;
    } catch (error) {
      const axiosError = isAxiosError(error)
        ? error
        : createAxiosError(error instanceof Error ? error.message : 'Request failed', mergedConfig);

      for (const handler of this.responseHandlers) {
        if (handler.onRejected) {
          await handler.onRejected(axiosError);
        }
      }

      throw axiosError;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('GET', url, config);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>('POST', url, { ...config, data });
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>('PUT', url, { ...config, data });
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>('PATCH', url, { ...config, data });
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('DELETE', url, config);
  }
}

const defaultAxios = new AxiosInstance();

const axios = {
  create(config?: AxiosRequestConfig) {
    return new AxiosInstance(config);
  },
  get: defaultAxios.get.bind(defaultAxios),
  post: defaultAxios.post.bind(defaultAxios),
  put: defaultAxios.put.bind(defaultAxios),
  patch: defaultAxios.patch.bind(defaultAxios),
  delete: defaultAxios.delete.bind(defaultAxios),
  isAxiosError,
};

function isAxiosError(error: unknown): error is AxiosError {
  return Boolean(error && typeof error === 'object' && 'isAxiosError' in error);
}

export default axios;