import React, { useState } from 'react';
import { Checkbox, FormGroup, FormControlLabel } from '@material-ui/core';
import { FuseAnimate } from '@fuse';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from '../store/actions';
import { MDText } from 'i18n-react';
import i18n from "../i18n";


function TodoSidebarContent(props) {
    const dispatch = useDispatch();
    const user = useSelector(({ auth }) => auth.user);
    const { filters: { active: activeChecked } } = useSelector(({ CrudAggregateManagement }) => CrudAggregateManagement.crudAggregates);
    const T = new MDText(i18n.get(user.locale));


    function handleActiveChange(evt) {
        if (activeChecked === null) {
            dispatch(Actions.setCrudAggregatesFilterActive(true));
        } else if (activeChecked) {
            dispatch(Actions.setCrudAggregatesFilterActive(false));
        } else {
            dispatch(Actions.setCrudAggregatesFilterActive(null));
        }
    }


    return (
        <FuseAnimate animation="transition.slideUpIn" delay={400}>

            <div className="flex-auto border-l-1 border-solid">

                <div className="p-24">
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={activeChecked === null ? false : activeChecked}
                                    indeterminate={activeChecked === null}
                                    onChange={handleActiveChange}
                                    value="active"
                                    inputProps={{
                                        'aria-label': 'primary checkbox',
                                    }}
                                />
                            }
                            label={T.translate("crud_aggregates.filters.active")}
                        />
                    </FormGroup>
                </div>




            </div>
        </FuseAnimate>
    );
}

export default TodoSidebarContent;
