import { gql } from 'apollo-boost';

export const ReporterMngReportListing = (variables) => ({
    query: gql`
            query ReporterMngReportListing($filterInput:ReporterMngReportFilterInput ,$paginationInput:ReporterMngReportPaginationInput,$sortInput:ReporterMngReportSortInput){
                ReporterMngReportListing(filterInput:$filterInput,paginationInput:$paginationInput,sortInput:$sortInput){
                    listing{
                       id,name,active,
                    },
                    queryTotalResultCount
                }
            }`,
    variables,
    fetchPolicy: 'network-only',
})

export const ReporterMngReport = (variables) => ({
    query: gql`
            query ReporterMngReport($id: ID!, $organizationId: String!){
                ReporterMngReport(id:$id, organizationId:$organizationId){
                    id,name,description,active,organizationId,
                    metadata{ createdBy, createdAt, updatedBy, updatedAt }
                }
            }`,
    variables,
    fetchPolicy: 'network-only',
})


export const ReporterMngCreateReport = (variables) => ({
    mutation: gql`
            mutation  ReporterMngCreateReport($input: ReporterMngReportInput!){
                ReporterMngCreateReport(input: $input){
                    id,name,description,active,organizationId,
                    metadata{ createdBy, createdAt, updatedBy, updatedAt }
                }
            }`,
    variables
})

export const ReporterMngDeleteReport = (variables) => ({
    mutation: gql`
            mutation ReporterMngReportListing($ids: [ID]!){
                ReporterMngDeleteReports(ids: $ids){
                    code,message
                }
            }`,
    variables
})

export const ReporterMngUpdateReport = (variables) => ({
    mutation: gql`
            ,mutation  ReporterMngUpdateReport($id: ID!,$input: ReporterMngReportInput!, $merge: Boolean!){
                ReporterMngUpdateReport(id:$id, input: $input, merge:$merge ){
                    id,organizationId,name,description,active
                }
            }`,
    variables
})

export const onReporterMngReportModified = (variables) => ([
    gql`subscription onReporterMngReportModified($id:ID!){
            ReporterMngReportModified(id:$id){    
                id,organizationId,name,description,active,
                metadata{ createdBy, createdAt, updatedBy, updatedAt }
            }
    }`,
    { variables }
])