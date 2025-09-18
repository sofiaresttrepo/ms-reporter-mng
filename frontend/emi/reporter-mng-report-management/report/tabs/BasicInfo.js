
import React from 'react';
import { TextField, FormControlLabel, Switch } from '@material-ui/core';
import * as Yup from "yup";
import _ from '@lodash';


export function basicInfoFormValidationsGenerator(T) {
    return {
        name: Yup.string()
            .min(3, T.translate("report.form_validations.name.length", {len:3}))
            .required(T.translate("report.form_validations.name.required"))
    };
}


/**
 * Aggregate BasicInfo form
 * @param {{dataSource,T}} props 
 */
export function BasicInfo(props) {
    const { dataSource: form, T, onChange, errors, touched, canWrite } = props;
    return (

        <div>
            <TextField
                className="mt-8 mb-16"
                helperText={(errors.name && touched.name) && errors.name}
                error={errors.name && touched.name}
                required
                label={T.translate("report.name")}
                autoFocus
                id="name"
                name="name"
                value={form.name}
                onChange={onChange("name")}
                onBlur={onChange("name")}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: !canWrite(),
                }}
            />

            <TextField
                className="mt-8 mb-16"
                helperText={(errors.description && touched.description) && errors.description}
                error={errors.description && touched.description}
                id="description"
                name="description"
                onChange={onChange("description")}
                onBlur={onChange("description")}
                label={T.translate("report.description")}
                type="text"
                value={form.description}
                multiline
                rows={5}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: !canWrite(),
                }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={form.active}
                        onChange={onChange("active")}
                        id="active"
                        name="active"
                        value={form.active}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                        variant="outlined"
                        disabled={!canWrite()}
                    />
                }
                label={T.translate("report.active")}
            />
        </div>
    );
}

