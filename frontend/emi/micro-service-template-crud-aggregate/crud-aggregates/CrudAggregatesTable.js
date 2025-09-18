import React, { useEffect, useState } from 'react';
import { Icon, Table, TableBody, TableCell, TablePagination, TableRow, Checkbox } from '@material-ui/core';
import { FuseScrollbars } from '@fuse';
import { withRouter } from 'react-router-dom';
import CrudAggregatesTableHead from './CrudAggregatesTableHead';
import * as Actions from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useSubscription } from "@apollo/react-hooks";
import { MDText } from 'i18n-react';
import i18n from "../i18n";
import { onMicroServiceTemplateCrudAggregateModified } from "../gql/CrudAggregate";

function CrudAggregatesTable(props) {
    const dispatch = useDispatch();
    const crudAggregates = useSelector(({ CrudAggregateManagement }) => CrudAggregateManagement.crudAggregates.data);
    const { filters, rowsPerPage, page, order, totalDataCount } = useSelector(({ CrudAggregateManagement }) => CrudAggregateManagement.crudAggregates);
    const user = useSelector(({ auth }) => auth.user);
    const [selected, setSelected] = useState([]);
    const T = new MDText(i18n.get(user.locale));

    const onMicroServiceTemplateCrudAggregateModifiedData = useSubscription(...onMicroServiceTemplateCrudAggregateModified({ id: "ANY" }));

    useEffect(() => {
        dispatch(Actions.setCrudAggregatesFilterOrganizationId(user.selectedOrganization.id));
    }, [user.selectedOrganization]);
    useEffect(() => {
        if (filters.organizationId){
            dispatch(Actions.getCrudAggregates({ filters, order, page, rowsPerPage }));
        }            
    }, [dispatch, filters, order, page, rowsPerPage, onMicroServiceTemplateCrudAggregateModifiedData.data]);


    function handleRequestSort(event, property) {
        const id = property;
        let direction = 'desc';

        if (order.id === property && order.direction === 'desc') {
            direction = 'asc';
        }

        dispatch(Actions.setCrudAggregatesOrder({ direction, id }));
    }


    function handleRequestRemove(event, property) {
        dispatch(Actions.removeCrudAggregates(selected, { filters, order, page, rowsPerPage }));
    }

    function handleSelectAllClick(event) {
        if (event.target.checked) {
            setSelected(crudAggregates.map(n => n.id));
            return;
        }
        setSelected([]);
    }

    function handleClick(item) {
        props.history.push('/crud-aggregate-mng/crud-aggregates/' + item.id + '/' + item.name.replace(/[\s_·!@#$%^&*(),.?":{}|<>]+/g, '-').toLowerCase());
    }

    function handleCheck(event, id) {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        }
        else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        }
        else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        }
        else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    }

    function handleChangePage(event, page) {
        dispatch(Actions.setCrudAggregatesPage(page));
    }

    function handleChangeRowsPerPage(event) {
        dispatch(Actions.setCrudAggregatesRowsPerPage(event.target.value));
    }

    return (
        <div className="w-full flex flex-col">

            <FuseScrollbars className="flex-grow overflow-x-auto">

                <Table className="min-w-xs" aria-labelledby="tableTitle">

                    <CrudAggregatesTableHead
                        numSelected={selected.length}
                        order={order}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        onRequestRemove={handleRequestRemove}
                        rowCount={crudAggregates.length}
                    />

                    <TableBody>
                        {
                            crudAggregates.map(n => {
                                const isSelected = selected.indexOf(n.id) !== -1;
                                return (
                                    <TableRow
                                        className="h-64 cursor-pointer"
                                        hover
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        tabIndex={-1}
                                        key={n.id}
                                        selected={isSelected}
                                        onClick={event => handleClick(n)}
                                    >
                                        <TableCell className="w-48 px-4 sm:px-12" padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onClick={event => event.stopPropagation()}
                                                onChange={event => handleCheck(event, n.id)}
                                            />
                                        </TableCell>


                                        <TableCell component="th" scope="row">
                                            {n.name}
                                        </TableCell>


                                        <TableCell component="th" scope="row" align="right">
                                            {n.active ?
                                                (
                                                    <Icon className="text-green text-20">check_circle</Icon>
                                                ) :
                                                (
                                                    <Icon className="text-red text-20">remove_circle</Icon>
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </FuseScrollbars>

            <TablePagination
                component="div"
                count={totalDataCount}
                rowsPerPage={rowsPerPage}
                page={page}
                backIconButtonProps={{
                    'aria-label': 'Previous Page'
                }}
                nextIconButtonProps={{
                    'aria-label': 'Next Page'
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                labelRowsPerPage={T.translate("crud_aggregates.rows_per_page")}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to === -1 ? count : to} ${T.translate("crud_aggregates.of")} ${count}`}
            />
        </div>
    );
}

export default withRouter(CrudAggregatesTable);
