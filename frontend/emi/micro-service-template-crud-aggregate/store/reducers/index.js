import {combineReducers} from 'redux';
import crudAggregates from './CrudAggregates.reducer';

const reducer = combineReducers({
    crudAggregates,
});

export default reducer;
