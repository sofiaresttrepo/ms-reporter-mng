import React from 'react';
import { Redirect } from 'react-router-dom';
import i18n from './i18n'

const auth = ["REPORT_READ"];

export const MicroFrontendConfig = {
    settings: {
        layout: {}
    },
    auth,
    routes: [
        { 
            path: '/report-mng/reports/:reportId/:reportHandle?',
            component: React.lazy(() => import('./report/Report'))
        },
        {
            path: '/report-mng/reports',
            component: React.lazy(() => import('./reports/Reports'))
        },
        {
            path: '/report-mng',
            component: () => <Redirect to="/report-mng/reports" />
        }
    ],
    navigationConfig: [
        {
            'id': 'settings',
            'type': 'collapse',
            'icon': 'settings',
            'priority': 100,
            children: [{
                'id': 'reporter-mng-report-management',
                'type': 'item',
                'icon': 'business',
                'url': '/report-mng',
                'priority': 2000,
                auth
            }]
        }
    ],
    i18nLocales: i18n.locales
};

