import React from 'react';
import { Icon, } from '@material-ui/core';
import { FuseAnimate } from '@fuse';
import { useSelector } from 'react-redux';
import { MDText } from 'i18n-react';
import i18n from "../i18n";

function TodoSidebarHeader() {
    const user = useSelector(({ auth }) => auth.user);
    const T = new MDText(i18n.get(user.locale));

    return (
        <div className="flex flex-col justify-center h-full p-24">

            <div className="flex items-center flex-1">
                <FuseAnimate animation="transition.expandIn" delay={300}>
                    <Icon className="text-32 mr-16">filter_list</Icon>
                </FuseAnimate>
                <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                    <span className="text-24">{T.translate("crud_aggregates.filters.title")}</span>
                </FuseAnimate>
            </div>

        </div>
    );
}

export default TodoSidebarHeader;
