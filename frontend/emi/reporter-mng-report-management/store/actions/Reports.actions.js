import { defer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import graphqlService from '../../../../services/graphqlService';
import { ReporterMngReportListing, ReporterMngDeleteReport } from '../../gql/Report';

export const SET_REPORTS = '[REPORT_MNG] SET REPORTS';
export const SET_REPORTS_PAGE = '[REPORT_MNG] SET REPORTS PAGE';
export const SET_REPORTS_ROWS_PER_PAGE = '[REPORT_MNG] SET REPORTS ROWS PER PAGE';
export const SET_REPORTS_ORDER = '[REPORT_MNG] SET REPORTS ORDER';
export const SET_REPORTS_FILTERS_ORGANIZATION_ID = '[REPORT_MNG] SET REPORTS FILTERS ORGANIZATION_ID';
export const SET_REPORTS_FILTERS_NAME = '[REPORT_MNG] SET REPORTS FILTERS NAME';
export const SET_REPORTS_FILTERS_ACTIVE = '[REPORT_MNG] SET REPORTS FILTERS ACTIVE';

/**
 * Common function to generate the arguments for the ReporterMngReportListing query based on the user input
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
 * Queries the Report Listing based on selected filters, page and order
 * @param {{ filters, order, page, rowsPerPage }} queryParams
 */
export function getReports({ filters, order, page, rowsPerPage }) {
    const args = getListingQueryArguments({ filters, order, page, rowsPerPage });    
    return (dispatch) => graphqlService.client.query(ReporterMngReportListing(args)).then(result => {
        return dispatch({
            type: SET_REPORTS,
            payload: result.data.ReporterMngReportListing
        });
    })
}

/**
 * Executes the mutation to remove the selected rows
 * @param {*} selectedForRemovalIds 
 * @param {*} param1 
 */
export function removeReports(selectedForRemovalIds, { filters, order, page, rowsPerPage }) {
    const deleteArgs = { ids: selectedForRemovalIds };
    const listingArgs = getListingQueryArguments({ filters, order, page, rowsPerPage });
    return (dispatch) => defer(() => graphqlService.client.mutate(ReporterMngDeleteReport(deleteArgs))).pipe(
        mergeMap(() => defer(() => graphqlService.client.query(ReporterMngReportListing(listingArgs)))),
        map((result) =>
            dispatch({
                type: SET_REPORTS,
                payload: result.data.ReporterMngReportListing
            })
        )
    ).toPromise();
}

/**
 * Set the listing page
 * @param {int} page 
 */
export function setReportsPage(page) {
    return {
        type: SET_REPORTS_PAGE,
        page
    }
}

/**
 * Set the number of rows to see per page
 * @param {*} rowsPerPage 
 */
export function setReportsRowsPerPage(rowsPerPage) {
    return {
        type: SET_REPORTS_ROWS_PER_PAGE,
        rowsPerPage
    }
}

/**
 * Set the table-column order
 * @param {*} order 
 */
export function setReportsOrder(order) {
    return {
        type: SET_REPORTS_ORDER,
        order
    }
}

/**
 * Set the name filter
 * @param {string} name 
 */
export function setReportsFilterName(name) {    
    return {
        type: SET_REPORTS_FILTERS_NAME,
        name
    }
}

/**
 * Set the filter active flag on/off/both
 * @param {boolean} active 
 */
export function setReportsFilterActive(active) {
    return {
        type: SET_REPORTS_FILTERS_ACTIVE,
        active
    }
}

/**
 * set the organizationId filter
 * @param {string} organizationId 
 */
export function setReportsFilterOrganizationId(organizationId) {    
    return {
        type: SET_REPORTS_FILTERS_ORGANIZATION_ID,
        organizationId
    }
}



