/* React core */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
/* UI core */
import { Button, Tab, Tabs, TextField, Icon, Typography, Switch, FormControlLabel } from '@material-ui/core';
import { FuseAnimate, FusePageCarded, FuseLoading } from '@fuse';
import { useForm } from '@fuse/hooks';
/* GraphQL Client hooks */
import { useSubscription, useLazyQuery, useMutation } from "@apollo/react-hooks";
/* Redux */
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import * as AppActions from 'app/store/actions';
import * as Actions from '../store/actions';
import reducer from '../store/reducers';
/* Tools */
import _ from '@lodash';
import { Formik } from 'formik';
import * as Yup from "yup";
import { MDText } from 'i18n-react';
import i18n from "../i18n";
/* Support pages */
import Error404Page from 'app/main/pages/Error404Page';
import Error500Page from 'app/main/pages/Error500Page';
/* GQL queries/mutation to use */
import {
    onMicroServiceTemplateCrudAggregateModified,
    MicroServiceTemplateCrudAggregate,
    MicroServiceTemplateCreateCrudAggregate,
    MicroServiceTemplateUpdateCrudAggregate
} from "../gql/CrudAggregate";
import Metadata from './tabs/Metadata';
import { BasicInfo, basicInfoFormValidationsGenerator } from './tabs/BasicInfo';


/**
 * Default Aggregate data when creating 
 */
const defaultData = {
    name: '',
    description: '',
    active: true,
};

function CrudAggregate(props) {
    //Redux dispatcher
    const dispatch = useDispatch();

    // current logged user
    const loggedUser = useSelector(({ auth }) => auth.user);

    // CrudAggregate STATE and CRUD ops
    const [crudAggregate, setCrudAggregate] = useState();
    const gqlCrudAggregate = MicroServiceTemplateCrudAggregate({ id: props.match.params.crudAggregateId });
    const [readCrudAggregate, readCrudAggregateResult] = useLazyQuery(gqlCrudAggregate.query, { fetchPolicy: gqlCrudAggregate.fetchPolicy })
    const [createCrudAggregate, createCrudAggregateResult] = useMutation(MicroServiceTemplateCreateCrudAggregate({}).mutation);
    const [updateCrudAggregate, updateCrudAggregateResult] = useMutation(MicroServiceTemplateUpdateCrudAggregate({}).mutation);
    const onCrudAggregateModifiedResult = useSubscription(...onMicroServiceTemplateCrudAggregateModified({ id: props.match.params.crudAggregateId }));

    //UI controls states
    const [tabValue, setTabValue] = useState(0);
    const { form, handleChange: formHandleChange, setForm } = useForm(null);
    const [errors, setErrors] = useState([]);

    //Translation services
    let T = new MDText(i18n.get(loggedUser.locale));

    /*
    *  ====== USE_EFFECT SECTION ========
    */

    /*
        Prepares the FORM:
            - if is NEW then use default data
            - if is old CrudAggregate then loads the data
        Reads (from the server) a CrudAggregate when:
            - having a valid props.match.params (aka ID)
            - having or changing the selected Organization ID
    */
    useEffect(() => {
        function updateCrudAggregateState() {
            const params = props.match.params;
            const { crudAggregateId } = params;
            if (crudAggregateId !== 'new') {
                if (loggedUser.selectedOrganization && loggedUser.selectedOrganization.id !== "") {
                    readCrudAggregate({ variables: { organizationId: loggedUser.selectedOrganization.id, id: crudAggregateId } });
                }
            } else if (loggedUser.selectedOrganization && loggedUser.selectedOrganization.id) {
                setCrudAggregate({ ...defaultData, organizationId: loggedUser.selectedOrganization.id })
                dispatch(Actions.setCrudAggregatesPage(0));
            }
        }
        updateCrudAggregateState();
    }, [dispatch, props.match.params, loggedUser.selectedOrganization]);


    //Refresh CrudAggregate state when the lazy query (READ) resolves
    useEffect(() => {
        if (readCrudAggregateResult.data)
            setCrudAggregate(readCrudAggregateResult.data.MicroServiceTemplateCrudAggregate)
    }, [readCrudAggregateResult])
    //Refresh CrudAggregate state when the CREATE mutation resolves
    useEffect(() => {
        if (createCrudAggregateResult.data && createCrudAggregateResult.data.MicroServiceTemplateCreateCrudAggregate) {
            setCrudAggregate(createCrudAggregateResult.data.MicroServiceTemplateCreateCrudAggregate)
            props.history.push('/crud-aggregate-mng/crud-aggregates/' + createCrudAggregateResult.data.MicroServiceTemplateCreateCrudAggregate.id + '/');
            dispatch(AppActions.showMessage({ message: T.translate("crud_aggregate.create_success"), variant: 'success' }));
        }

    }, [createCrudAggregateResult])
    //Refresh CrudAggregate state when the UPDATE mutation resolves
    useEffect(() => {
        if (updateCrudAggregateResult.data) {
            setCrudAggregate(updateCrudAggregateResult.data.MicroServiceTemplateUpdateCrudAggregate);
        }
    }, [updateCrudAggregateResult])
    //Refresh CrudAggregate state when GQL subscription notifies a change
    useEffect(() => {
        if (onCrudAggregateModifiedResult.data) {
            setForm(onCrudAggregateModifiedResult.data.MicroServiceTemplateCrudAggregateModified);
            dispatch(AppActions.showMessage({ message: T.translate("crud_aggregate.update_success"), variant: 'success' }));
        }
    }, [onCrudAggregateModifiedResult.data]);


    // Keep the sync between the CrudAggregate state and the form state
    useEffect(() => {
        if ((crudAggregate && !form) || (crudAggregate && form && crudAggregate.id !== form.id)) {
            setForm(crudAggregate);
        }
    }, [form, crudAggregate, setForm]);

    // DISPLAYS floating message for CRUD errors
    useEffect(() => {
        const error = createCrudAggregateResult.error || updateCrudAggregateResult.error;
        if (error) {
            const { graphQLErrors, networkError, message } = error;
            const errMessage = networkError
                ? JSON.stringify(networkError)
                : graphQLErrors.length === 0
                    ? message
                    : graphQLErrors[0].message.name
            dispatch(AppActions.showMessage({
                message: errMessage,
                variant: 'error'
            }));
        }
    }, [createCrudAggregateResult.error, updateCrudAggregateResult.error])

    /*
    *  ====== FORM HANDLERS, VALIDATORS AND LOGIC ========
    */

    /**
     * Handles Tab changes
     * @param {*} event 
     * @param {*} tabValue 
     */
    function handleChangeTab(event, tabValue) {
        setTabValue(tabValue);
    }

    /**
     * Evaluates if the logged user has enought permissions to WRITE (Create/Update/Delete) data
     */
    function canWrite() {
        return loggedUser.role.includes('CRUD_AGGREGATE_WRITE');
    }

    /**
     * Evals if the Save button can be submitted
     */
    function canBeSubmitted() {
        return (
            canWrite()
            && !updateCrudAggregateResult.loading
            && !createCrudAggregateResult.loading
            && _.isEmpty(errors)
            && !_.isEqual({ ...crudAggregate, metadata: undefined }, { ...form, metadata: undefined })
        );
    }

    /**
     * Handle the Save button action
     */
    function handleSave() {
        const { id } = form;
        if (id === undefined) {
            createCrudAggregate({ variables: { input: { ...form, organizationId: loggedUser.selectedOrganization.id } } });
        } else {
            updateCrudAggregate({ variables: { id, input: { ...form, id: undefined, __typename: undefined, metadata: undefined }, merge: true } });
        }
    }

    /*
    *  ====== ALTERNATIVE PAGES TO RENDER ========
    */

    // Shows an ERROR page when a really important server response fails
    const gqlError = readCrudAggregateResult.error;
    if (gqlError) {
        const firstErrorMessage = gqlError.graphQLErrors[0].message;
        if (!firstErrorMessage.includes || !firstErrorMessage.includes("Cannot return null")) {
            return (<Error500Page message={T.translate("crud_aggregate.internal_server_error")}
                description={gqlError.graphQLErrors.map(e => `@${e.path[0]} => code ${e.message.code}: ${e.message.name}`)} />);
        }
    }

    // Shows the Loading bar if we are waiting for something mandatory
    if (!loggedUser.selectedOrganization || readCrudAggregateResult.loading) {
        return (<FuseLoading />);
    }

    // Shows a NotFound page if the CrudAggregate has not been found. (maybe because it belongs to other organization or the id does not exists)
    if (props.match.params.crudAggregateId !== "new" && !readCrudAggregateResult.data) {
        return (<Error404Page message={T.translate("crud_aggregate.not_found")} />);
    }


    /*
    *  ====== FINAL PAGE TO RENDER ========
    */

    return (
        <FusePageCarded
            classes={{
                toolbar: "p-0",
                header: "min-h-72 h-72 sm:h-136 sm:min-h-136"
            }}
            header={
                form && (
                    <div className="flex flex-1 w-full items-center justify-between">

                        <div className="flex flex-col items-start max-w-full">

                            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                                <Typography className="normal-case flex items-center sm:mb-12" component={Link} role="button" to="/crud-aggregate-mng/crud-aggregates" color="inherit">
                                    <Icon className="mr-4 text-20">arrow_back</Icon>
                                    {T.translate("crud_aggregate.crud_aggregates")}
                                </Typography>
                            </FuseAnimate>

                            <div className="flex items-center max-w-full">
                                <FuseAnimate animation="transition.expandIn" delay={300}>
                                    <Icon className="text-32 mr-0 sm:text-48 mr-12">business</Icon>
                                </FuseAnimate>

                                <div className="flex flex-col min-w-0">
                                    <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                        <Typography className="text-16 sm:text-20 truncate">
                                            {form.name ? form.name : 'New CrudAggregate'}
                                        </Typography>
                                    </FuseAnimate>
                                    <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                        <Typography variant="caption">{T.translate("crud_aggregate.crud_aggregate_detail")}</Typography>
                                    </FuseAnimate>
                                </div>
                            </div>
                        </div>
                        <FuseAnimate animation="transition.slideRightIn" delay={300}>
                            <Button
                                className="whitespace-no-wrap"
                                variant="contained"
                                disabled={!canBeSubmitted()}
                                onClick={handleSave}
                            >
                                {T.translate("crud_aggregate.save")}
                            </Button>
                        </FuseAnimate>
                    </div>
                )
            }
            contentToolbar={
                <Tabs
                    value={tabValue}
                    onChange={handleChangeTab}
                    indicatorColor="secondary"
                    textColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                    classes={{ root: "w-full h-64" }}
                >
                    <Tab className="h-64 normal-case" label={T.translate("crud_aggregate.basic_info")} />

                    {(form && form.metadata) && (<Tab className="h-64 normal-case" label={T.translate("crud_aggregate.metadata_tab")} />)}
                </Tabs>
            }
            content={
                form && (
                    <div className="p-16 sm:p-24 max-w-2xl">

                        <Formik
                            initialValues={{ ...form }}
                            enableReinitialize
                            onSubmit={handleSave}
                            validationSchema={Yup.object().shape({
                                ...basicInfoFormValidationsGenerator(T)
                            })}

                        >

                            {(props) => {
                                const {
                                    values,
                                    touched,
                                    errors,
                                    setFieldTouched,
                                    handleChange,
                                    handleSubmit
                                } = props;

                                setErrors(errors);
                                const onChange = (fieldName) => (event) => {
                                    event.persist();
                                    setFieldTouched(fieldName);
                                    handleChange(event);
                                    formHandleChange(event);
                                };

                                return (
                                    <form noValidate onSubmit={handleSubmit}>
                                        {tabValue === 0 && <BasicInfo dataSource={values} {...{ T, onChange, canWrite, errors, touched }} />}
                                        {tabValue === 1 && <Metadata dataSource={values} T={T} />}
                                    </form>
                                );
                            }}
                        </Formik>



                    </div>
                )
            }
            innerScroll
        />
    )
}

export default withReducer('CrudAggregateManagement', reducer)(CrudAggregate);
