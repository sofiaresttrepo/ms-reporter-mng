
import React from 'react';
import { TextField } from '@material-ui/core';



/**
 * Aggregate Metadata read-only form
 * @param {{dataSource,T}} props 
 */
function Metadata(props) {
    // parent date
    const { dataSource , T, } = props;
    //Responsive styles
    const fullHalfStyle = "w-full p-2 sm:w-1/2";

    return (
        <div>
            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("report.metadata.createdBy")}
                id="createdBy"
                name="createdBy"
                value={!dataSource.metadata ? "" : dataSource.metadata.createdBy}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />

            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("report.metadata.createdAt")}
                id="createdAt"
                name="createdAt"
                value={!dataSource.metadata ? "" : new Date(dataSource.metadata.createdAt).toLocaleString()}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />

            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("report.metadata.updatedBy")}
                id="updatedBy"
                name="updatedBy"
                value={!dataSource.metadata ? "" : dataSource.metadata.updatedBy}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />


            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("report.metadata.updatedAt")}
                id="updatedAt"
                name="updatedAt"
                value={!dataSource.metadata ? "" : new Date(dataSource.metadata.updatedAt).toLocaleString()}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />

        </div>
    );
}

export default Metadata;

