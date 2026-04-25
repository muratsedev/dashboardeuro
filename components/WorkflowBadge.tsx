'use client';

// WorkflowStatus values mirror the backend enum
export type WorkflowStatus = 0 | 1 | 2 | 3 | 4;

export const WorkflowLabels: Record<WorkflowStatus, string> = {
  0: 'مسودة',
  1: 'قيد المراجعة',
  2: 'موافق عليه',
  3: 'مرفوض',
  4: 'منشور',
};

const badgeClasses: Record<WorkflowStatus, string> = {
  0: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  3: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  4: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function WorkflowBadge({ status }: { status: WorkflowStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeClasses[status]}`}>
      {WorkflowLabels[status]}
    </span>
  );
}
