import { defer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import graphqlService from '../../../../services/graphqlService';
import { MicroServiceTemplateCrudAggregateListing, MicroServiceTemplateDeleteCrudAggregate } from '../../gql/CrudAggregate';

export const SET_CRUD_AGGREGATES = '[CRUD_AGGREGATE_MNG] SET CRUD_AGGREGATES';
export const SET_CRUD_AGGREGATES_PAGE = '[CRUD_AGGREGATE_MNG] SET CRUD_AGGREGATES PAGE';
export const SET_CRUD_AGGREGATES_ROWS_PER_PAGE = '[CRUD_AGGREGATE_MNG] SET CRUD_AGGREGATES ROWS PER PAGE';
export const SET_CRUD_AGGREGATES_ORDER = '[CRUD_AGGREGATE_MNG] SET CRUD_AGGREGATES ORDER';
export const SET_CRUD_AGGREGATES_FILTERS_ORGANIZATION_ID = '[CRUD_AGGREGATE_MNG] SET CRUD_AGGREGATES FILTERS ORGANIZATION_ID';
export const SET_CRUD_AGGREGATES_FILTERS_NAME = '[CRUD_AGGREGATE_MNG] SET CRUD_AGGREGATES FILTERS NAME';
export const SET_CRUD_AGGREGATES_FILTERS_ACTIVE = '[CRUD_AGGREGATE_MNG] SET CRUD_AGGREGATES FILTERS ACTIVE';

/**
 * Common function to generate the arguments for the MicroServiceTemplateCrudAggregateListing query based on the user input
 * @param {Object} queryParams 
 */
function getListingQueryArguments({ filters: { name, organizationId, active }, order, page, rowsPerPage }) {
    const args = {
        "filterInput": { organizationId },
        "paginationInput": { "page": page, "count": rowsPerPage, "queryTotalResultCount": (page === 0) },
        "sortInput": order.id ? { "field": order.id, "asc": order.direction === "asc" } : undefined
    };
    if (name.trim().length > 0) {
        args.filterInput.name = name;
    }
    if (active !== null) {
        args.filterInput.active = active;
    }
    return args;
}

/**
 * Queries the CrudAggregate Listing based on selected filters, page and order
 * @param {{ filters, order, page, rowsPerPage }} queryParams
 */
export function getCrudAggregates({ filters, order, page, rowsPerPage }) {
    const args = getListingQueryArguments({ filters, order, page, rowsPerPage });    
    return (dispatch) => graphqlService.client.query(MicroServiceTemplateCrudAggregateListing(args)).then(result => {
        return dispatch({
            type: SET_CRUD_AGGREGATES,
            payload: result.data.MicroServiceTemplateCrudAggregateListing
        });
    })
}

/**
 * Executes the mutation to remove the selected rows
 * @param {*} selectedForRemovalIds 
 * @param {*} param1 
 */
export function removeCrudAggregates(selectedForRemovalIds, { filters, order, page, rowsPerPage }) {
    const deleteArgs = { ids: selectedForRemovalIds };
    const listingArgs = getListingQueryArguments({ filters, order, page, rowsPerPage });
    return (dispatch) => defer(() => graphqlService.client.mutate(MicroServiceTemplateDeleteCrudAggregate(deleteArgs))).pipe(
        mergeMap(() => defer(() => graphqlService.client.query(MicroServiceTemplateCrudAggregateListing(listingArgs)))),
        map((result) =>
            dispatch({
                type: SET_CRUD_AGGREGATES,
                payload: result.data.MicroServiceTemplateCrudAggregateListing
            })
        )
    ).toPromise();
}

/**
 * Set the listing page
 * @param {int} page 
 */
export function setCrudAggregatesPage(page) {
    return {
        type: SET_CRUD_AGGREGATES_PAGE,
        page
    }
}

/**
 * Set the number of rows to see per page
 * @param {*} rowsPerPage 
 */
export function setCrudAggregatesRowsPerPage(rowsPerPage) {
    return {
        type: SET_CRUD_AGGREGATES_ROWS_PER_PAGE,
        rowsPerPage
    }
}

/**
 * Set the table-column order
 * @param {*} order 
 */
export function setCrudAggregatesOrder(order) {
    return {
        type: SET_CRUD_AGGREGATES_ORDER,
        order
    }
}

/**
 * Set the name filter
 * @param {string} name 
 */
export function setCrudAggregatesFilterName(name) {    
    return {
        type: SET_CRUD_AGGREGATES_FILTERS_NAME,
        name
    }
}

/**
 * Set the filter active flag on/off/both
 * @param {boolean} active 
 */
export function setCrudAggregatesFilterActive(active) {
    return {
        type: SET_CRUD_AGGREGATES_FILTERS_ACTIVE,
        active
    }
}

/**
 * set the organizationId filter
 * @param {string} organizationId 
 */
export function setCrudAggregatesFilterOrganizationId(organizationId) {    
    return {
        type: SET_CRUD_AGGREGATES_FILTERS_ORGANIZATION_ID,
        organizationId
    }
}



