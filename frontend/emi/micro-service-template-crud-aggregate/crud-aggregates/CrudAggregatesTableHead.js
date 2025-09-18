import React, { useState } from 'react';
import { TableHead, TableSortLabel, TableCell, TableRow, Checkbox, Tooltip, IconButton, Icon, Menu, MenuList, MenuItem, ListItemIcon, ListItemText, } from '@material-ui/core';
import { Button, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import { makeStyles } from '@material-ui/styles';
import { MDText } from 'i18n-react';
import i18n from "../i18n";




const useStyles = makeStyles(theme => ({
    actionsButtonWrapper: {
        background: theme.palette.background.paper
    }
}));

function CrudAggregatesTableHead(props) {
    const dispatch = useDispatch();
    const order = useSelector(({ CrudAggregateManagement }) => CrudAggregateManagement.crudAggregates.order);
    const user = useSelector(({ auth }) => auth.user);
    let T = new MDText(i18n.get(user.locale));
    const classes = useStyles(props);
    const [selectedCrudAggregatesMenu, setSelectedCrudAggregatesMenu] = useState(null);


    const rows = [
        {
            id: 'name',
            align: 'left',
            disablePadding: false,
            label: T.translate("crud_aggregates.table_colums.name"),
            sort: true
        },
        {
            id: 'active',
            align: 'right',
            disablePadding: false,
            label: T.translate("crud_aggregates.table_colums.active"),
            sort: true
        }
    ];

    const createSortHandler = property => event => {
        props.onRequestSort(event, property);
    };

    const removeHandler = () => {
        props.onRequestRemove();
    };

    function openSelectedCrudAggregatesMenu(event) {
        setSelectedCrudAggregatesMenu(event.currentTarget);
    }

    function closeSelectedCrudAggregatesMenu() {
        setSelectedCrudAggregatesMenu(null);
    }

    return (
        <TableHead>
            <TableRow className="h-64">
                <TableCell padding="checkbox" className="relative pl-4 sm:pl-12">
                    <Checkbox
                        indeterminate={props.numSelected > 0 && props.numSelected < props.rowCount}
                        checked={props.numSelected === props.rowCount}
                        onChange={props.onSelectAllClick}
                    />
                    {props.numSelected > 0 && (
                        <div className={clsx("flex items-center justify-center absolute w-64 top-0 left-0 ml-68 h-64 z-10", classes.actionsButtonWrapper)}>
                            <IconButton
                                aria-owns={selectedCrudAggregatesMenu ? 'selectedCrudAggregatesMenu' : null}
                                aria-haspopup="true"
                                onClick={openSelectedCrudAggregatesMenu}
                            >
                                <Icon>more_horiz</Icon>
                            </IconButton>
                            <Menu
                                id="selectedCrudAggregatesMenu"
                                anchorEl={selectedCrudAggregatesMenu}
                                open={Boolean(selectedCrudAggregatesMenu)}
                                onClose={closeSelectedCrudAggregatesMenu}
                            >
                                <MenuList>
                                    <MenuItem
                                        onClick={() => dispatch(Actions.openDialog({
                                            children: (
                                                <React.Fragment>
                                                    <DialogTitle id="alert-dialog-title">{T.translate("crud_aggregates.remove_dialog_title")}</DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {T.translate("crud_aggregates.remove_dialog_description")}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={() => { dispatch(Actions.closeDialog()); closeSelectedCrudAggregatesMenu() }} color="primary">
                                                            {T.translate("crud_aggregates.remove_dialog_no")}
                                                        </Button>
                                                        <Button onClick={() => { dispatch(Actions.closeDialog()); closeSelectedCrudAggregatesMenu(); removeHandler() }} color="primary" autoFocus>
                                                            {T.translate("crud_aggregates.remove_dialog_yes")}
                                                        </Button>
                                                    </DialogActions>
                                                </React.Fragment>
                                            )
                                        }))}
                                    >

                                        <ListItemIcon className="min-w-40">
                                            <Icon>delete</Icon>
                                        </ListItemIcon>
                                        <ListItemText primary={T.translate("crud_aggregates.remove")} />

                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </div>
                    )}
                </TableCell>
                {rows.map(row => {
                    return (
                        <TableCell
                            key={row.id}
                            align={row.align}
                            padding={row.disablePadding ? 'none' : 'default'}
                            sortDirection={order.id === row.id ? order.direction : false}
                        >
                            {row.sort && (
                                <Tooltip
                                    title="Sort"
                                    placement={row.align === "right" ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={order.id === row.id}
                                        direction={order.direction}
                                        onClick={createSortHandler(row.id)}
                                    >
                                        {row.label}
                                    </TableSortLabel>
                                </Tooltip>
                            )}
                            {!row.sort && (
                                row.label
                            )}
                        </TableCell>
                    );
                }, this)}
            </TableRow>
        </TableHead>
    );
}

export default CrudAggregatesTableHead;
