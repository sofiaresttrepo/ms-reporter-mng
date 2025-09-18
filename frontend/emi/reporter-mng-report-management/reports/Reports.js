import React, {useRef} from 'react';
import {FusePageCarded} from '@fuse';
import { useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import ReportsTable from './ReportsTable';
import ReportsHeader from './ReportsHeader';
import reducer from '../store/reducers';
import {FuseLoading} from '@fuse';

import ReportsFilterHeader from './ReportsFilterHeader';
import ReportsFilterContent from './ReportsFilterContent';

function Reports()
{
    const user = useSelector(({ auth }) => auth.user);
    const pageLayout = useRef(null);

    
    if(!user.selectedOrganization){
        return (<FuseLoading />);
    }

    return (
        <FusePageCarded
            classes={{
                content: "flex",
                //header : "min-h-72 h-72 sm:h-136 sm:min-h-136" // default tall/short header
                header: "min-h-72 h-72 sm:h-72 sm:min-h-72" // short header always
            }}
            header={
                <ReportsHeader pageLayout={pageLayout} />
            }
            content={
                <ReportsTable/>
            }

            leftSidebarHeader={
                <ReportsFilterHeader/>
            }
            leftSidebarContent={
                <ReportsFilterContent/>
            }
            ref={pageLayout}
            innerScroll
            leftSidebarVariant='permanent'
        />
    );
}

export default withReducer('ReportManagement', reducer)(Reports);
