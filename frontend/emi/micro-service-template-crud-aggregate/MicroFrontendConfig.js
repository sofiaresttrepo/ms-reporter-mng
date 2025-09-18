import React from 'react';
import { Redirect } from 'react-router-dom';
import i18n from './i18n'

const auth = ["CRUD_AGGREGATE_READ"];

export const MicroFrontendConfig = {
    settings: {
        layout: {}
    },
    auth,
    routes: [
        { 
            path: '/crud-aggregate-mng/crud-aggregates/:crudAggregateId/:crudAggregateHandle?',
            component: React.lazy(() => import('./crud-aggregate/CrudAggregate'))
        },
        {
            path: '/crud-aggregate-mng/crud-aggregates',
            component: React.lazy(() => import('./crud-aggregates/CrudAggregates'))
        },
        {
            path: '/crud-aggregate-mng',
            component: () => <Redirect to="/crud-aggregate-mng/crud-aggregates" />
        }
    ],
    navigationConfig: [
        {
            'id': 'settings',
            'type': 'collapse',
            'icon': 'settings',
            'priority': 100,
            children: [{
                'id': 'micro-service-template-crud-aggregate',
                'type': 'item',
                'icon': 'business',
                'url': '/crud-aggregate-mng',
                'priority': 2000,
                auth
            }]
        }
    ],
    i18nLocales: i18n.locales
};

