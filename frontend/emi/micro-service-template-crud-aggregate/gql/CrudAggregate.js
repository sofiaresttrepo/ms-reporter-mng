import { gql } from 'apollo-boost';

export const MicroServiceTemplateCrudAggregateListing = (variables) => ({
    query: gql`
            query MicroServiceTemplateCrudAggregateListing($filterInput:MicroServiceTemplateCrudAggregateFilterInput ,$paginationInput:MicroServiceTemplateCrudAggregatePaginationInput,$sortInput:MicroServiceTemplateCrudAggregateSortInput){
                MicroServiceTemplateCrudAggregateListing(filterInput:$filterInput,paginationInput:$paginationInput,sortInput:$sortInput){
                    listing{
                       id,name,active,
                    },
                    queryTotalResultCount
                }
            }`,
    variables,
    fetchPolicy: 'network-only',
})

export const MicroServiceTemplateCrudAggregate = (variables) => ({
    query: gql`
            query MicroServiceTemplateCrudAggregate($id: ID!, $organizationId: String!){
                MicroServiceTemplateCrudAggregate(id:$id, organizationId:$organizationId){
                    id,name,description,active,organizationId,
                    metadata{ createdBy, createdAt, updatedBy, updatedAt }
                }
            }`,
    variables,
    fetchPolicy: 'network-only',
})


export const MicroServiceTemplateCreateCrudAggregate = (variables) => ({
    mutation: gql`
            mutation  MicroServiceTemplateCreateCrudAggregate($input: MicroServiceTemplateCrudAggregateInput!){
                MicroServiceTemplateCreateCrudAggregate(input: $input){
                    id,name,description,active,organizationId,
                    metadata{ createdBy, createdAt, updatedBy, updatedAt }
                }
            }`,
    variables
})

export const MicroServiceTemplateDeleteCrudAggregate = (variables) => ({
    mutation: gql`
            mutation MicroServiceTemplateCrudAggregateListing($ids: [ID]!){
                MicroServiceTemplateDeleteCrudAggregates(ids: $ids){
                    code,message
                }
            }`,
    variables
})

export const MicroServiceTemplateUpdateCrudAggregate = (variables) => ({
    mutation: gql`
            ,mutation  MicroServiceTemplateUpdateCrudAggregate($id: ID!,$input: MicroServiceTemplateCrudAggregateInput!, $merge: Boolean!){
                MicroServiceTemplateUpdateCrudAggregate(id:$id, input: $input, merge:$merge ){
                    id,organizationId,name,description,active
                }
            }`,
    variables
})

export const onMicroServiceTemplateCrudAggregateModified = (variables) => ([
    gql`subscription onMicroServiceTemplateCrudAggregateModified($id:ID!){
            MicroServiceTemplateCrudAggregateModified(id:$id){    
                id,organizationId,name,description,active,
                metadata{ createdBy, createdAt, updatedBy, updatedAt }
            }
    }`,
    { variables }
])