import React, { useState, useEffect } from 'react';
import { Paper, Button, Input, Icon, Typography, Hidden, IconButton } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { FuseAnimate } from '@fuse';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as Actions from '../store/actions';
import { MDText } from 'i18n-react';
import i18n from "../i18n";
import _ from '@lodash';
import { useEventCallback } from 'rxjs-hooks'
import { debounceTime } from "rxjs/operators";

function ReportsHeader(props) {
    const dispatch = useDispatch();
    const user = useSelector(({ auth }) => auth.user);
    const mainTheme = useSelector(({ fuse }) => fuse.settings.mainTheme);
    const searchTextFilter = useSelector(({ ReportManagement }) => ReportManagement.reports.filters.name);
    const [searchText, setSearchText] = useState(searchTextFilter)
    const [keywordCallBack, keyword] = useEventCallback(
        (event$) => event$.pipe(debounceTime(500))
    )

    const T = new MDText(i18n.get(user.locale));

    function handleSearchChange(evt) {
        keywordCallBack(evt.target.value);
        setSearchText(evt.target.value);
    }
    useEffect(() => {
        if (keyword !== undefined && keyword !== null)
            dispatch(Actions.setReportsFilterName(keyword))
    }, [keyword]);

    return (
        <div className="flex flex-1 w-full items-center justify-between">

            <Hidden lgUp>
                <IconButton
                    onClick={(ev) => props.pageLayout.current.toggleLeftSidebar()}
                    aria-label="open left sidebar"
                >
                    <Icon>filter_list</Icon>
                </IconButton>
            </Hidden>

            <div className="flex items-center">
                <FuseAnimate animation="transition.expandIn" delay={300}>
                    <Icon className="text-32 mr-0 sm:mr-12">business</Icon>
                </FuseAnimate>
                <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                    <Typography className="hidden sm:flex" variant="h6">{T.translate("reports.reports")} </Typography>
                </FuseAnimate>
            </div>

            <div className="flex flex-1 items-center justify-center px-12">

                <ThemeProvider theme={mainTheme}>
                    <FuseAnimate animation="transition.slideDownIn" delay={300}>
                        <Paper className="flex items-center w-full max-w-512 px-8 py-4 rounded-8" elevation={1}>

                            <Icon className="mr-8" color="action">search</Icon>

                            <Input
                                placeholder={T.translate("reports.search")}
                                className="flex flex-1"
                                disableUnderline
                                fullWidth
                                value={searchText}
                                inputProps={{
                                    'aria-label': 'Search'
                                }}
                                onChange={handleSearchChange}
                            />
                        </Paper>
                    </FuseAnimate>
                </ThemeProvider>

            </div>
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button component={Link} to="/report-mng/reports/new" className="whitespace-no-wrap" variant="contained">
                    <span className="hidden sm:flex">{T.translate("reports.add_new_report")}</span>
                    <span className="flex sm:hidden">{T.translate("reports.add_new_report_short")}</span>
                </Button>
            </FuseAnimate>
        </div>
    );
}

export default ReportsHeader;
