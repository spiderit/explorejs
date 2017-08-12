/* eslint-disable no-unused-vars */
import initialState from './initialState';

import {SUMMARY_QUESTION_ANSWERED, SWITCH_INSTRUCTIONS} from '../constants/actionTypes';

export default function testingReducer(state = initialState.testing, action) {
  return state; // todo maybe impement something here
}

export const finalAnswersReducer = (state = initialState.finalAnswers, action) => {
  switch (action.type) {
    case SUMMARY_QUESTION_ANSWERED:
      return {
        ...state,
        [action.questionId]: action.value
      };
    default:
      return state;
  }
}


export const switchInstructionsReducer = (state = true, action) => {
  switch (action.type) {
    case SWITCH_INSTRUCTIONS:
      return !state;
  }
  return state;
};
