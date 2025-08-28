'use client';

import { useTranslation } from 'react-i18next';

// Component to translate department names
export const DepartmentName = ({ department }) => {
    const { t } = useTranslation();
    return t(`departments.${department}`, department);
};

// Component to translate status
export const StatusText = ({ status }) => {
    const { t } = useTranslation();
    return t(`status.${status}`, status);
};

// Component to translate priority
export const PriorityText = ({ priority }) => {
    const { t } = useTranslation();
    return t(`priority.${priority}`, priority);
};

// Hook for translations
export const useAppTranslations = () => {
    const { t } = useTranslation();

    return {
        translateDepartment: (dept) => t(`departments.${dept}`, dept),
        translateStatus: (status) => t(`status.${status}`, status),
        translatePriority: (priority) => t(`priority.${priority}`, priority),
        t
    };
};
