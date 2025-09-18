export default {
  navigation: {
    'settings': 'Configuraciones',
    'micro-service-template-crud-aggregate': 'CrudAggregates',
  },
  crud_aggregates: {
    crud_aggregates: 'CrudAggregates',
    search: 'Búsqueda rápida por nombre',
    add_new_crud_aggregate: 'Agregar Nueva',
    add_new_crud_aggregate_short: 'Agregar',
    rows_per_page: 'Filas por página:',
    of: 'de',
    remove: 'Eliminar',
    table_colums: {
      name: 'Nombre',
      active: 'Activo'
    },
    remove_dialog_title: "¿Desea eliminar las crudAggregates seleccionadas?",
    remove_dialog_description: "Esta acción no se puede deshacer",
    remove_dialog_no: "No",
    remove_dialog_yes: "Si",
    filters: {
      title: "Filtros",
      active: "Activo"
    }
  },
  crud_aggregate: {
    crud_aggregates: 'CrudAggregates',
    crud_aggregate_detail: 'Detalle de la CrudAggregate',
    save: 'GUARDAR',
    basic_info: 'Información Básica',
    name: 'Nombre',
    description: 'Descripción',
    active: 'Activo',
    metadata_tab: 'Metadatos',
    metadata: {
      createdBy: 'Creado por',
      createdAt: 'Creado el',
      updatedBy: 'Modificado por',
      updatedAt: 'Modificado el',
    },
    not_found: 'Lo sentimos pero no pudimos encontrar la entidad que busca',
    internal_server_error: 'Error Interno del Servidor',
    update_success: 'CrudAggregate ha sido actualizado',
    create_success: 'CrudAggregate ha sido creado',
    form_validations: {
      name: {
        length: "El nombre debe tener al menos {len} caracteres",
        required: "El nombre es requerido",
      }
    },
  }
};