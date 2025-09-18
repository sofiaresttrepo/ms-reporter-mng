import {combineReducers} from 'redux';
import reports from './Reports.reducer';

const reducer = combineReducers({
    reports,
});

export default reducer;
