import * as Actions from '../actions';

const initialState = {
    data: [],
    totalDataCount: 0,
    page: 0,
    rowsPerPage: 10,
    order: {
        direction: 'asc',
        id: null
    },
    filters: {
        name: '',
        active: null,
        organizationId: undefined
    }
};

const crudAggregatesReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_CRUD_AGGREGATES:
            {
                const { listing, queryTotalResultCount } = action.payload;
                return {
                    ...state,
                    data: listing,
                    totalDataCount: queryTotalResultCount ? queryTotalResultCount : state.totalDataCount,
                };
            }
        case Actions.SET_CRUD_AGGREGATES_PAGE:
            {
                return {
                    ...state,
                    page: action.page
                };
            }
        case Actions.SET_CRUD_AGGREGATES_ROWS_PER_PAGE:
            {
                return {
                    ...state,
                    rowsPerPage: action.rowsPerPage
                };
            }
        case Actions.SET_CRUD_AGGREGATES_ORDER:
            {
                return {
                    ...state,
                    order: action.order
                };
            }
        case Actions.SET_CRUD_AGGREGATES_FILTERS_ORGANIZATION_ID:
            {
                return {
                    ...state,
                    filters: { ...state.filters, organizationId: action.organizationId }
                };
            }
        case Actions.SET_CRUD_AGGREGATES_FILTERS_NAME:
            {
                return {
                    ...state,
                    filters: { ...state.filters, name: action.name }
                };
            }
        case Actions.SET_CRUD_AGGREGATES_FILTERS_ACTIVE:
            {
                return {
                    ...state,
                    filters: { ...state.filters, active: action.active }
                };
            }
        default:
            {
                return state;
            }
    }
};

export default crudAggregatesReducer;
