export default {
  navigation: {
    'settings': 'Settings',
    'micro-service-template-crud-aggregate': 'CrudAggregates',
  },
  crud_aggregates: {
    crud_aggregates: 'CrudAggregates',
    search: 'Quick search by name',
    add_new_crud_aggregate: 'ADD NEW',
    add_new_crud_aggregate_short: 'NEW',
    rows_per_page: 'Rows per page:',
    of: 'of',
    remove: 'Remove',
    table_colums: {
      name: 'Name',
      active: 'Active'
    },
    remove_dialog_title: "Do you want to delete the selected CrudAggregates??",
    remove_dialog_description: "This action can not be undone",
    remove_dialog_no: "No",
    remove_dialog_yes: "Yes",
    filters: {
      title: "Filters",
      active: "Active"
    }
  },
  crud_aggregate: {
    crud_aggregates: 'CrudAggregates',
    crud_aggregate_detail: 'CrudAggregate detail',
    save: 'SAVE',
    basic_info: 'Basic Info',
    name: 'Name',
    description: 'Description',
    active: 'Active',
    metadata_tab: 'Metadata',
    metadata: {
      createdBy: 'Created by',
      createdAt: 'Created at',
      updatedBy: 'Modified by',
      updatedAt: 'Modified at',
    },
    not_found: 'Sorry but we could not find the entity you are looking for',
    internal_server_error: 'Internal Server Error',
    update_success: 'CrudAggregate has been updated',
    create_success: 'CrudAggregate has been created',
    form_validations: {
      name: {
        length: "Name must be at least {len} characters",
        required: "Name is required",
      }
    },
  }
};