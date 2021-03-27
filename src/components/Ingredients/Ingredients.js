import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
    switch (action.type) {
        case 'SET':
            return action.ingredients;
        case 'ADD':
            return [...currentIngredients, action.ingredient];
        case 'DELETE':
            return currentIngredients.filter((ing) => ing.id !== action.id);
        default:
            throw new Error('Should not get here!');
    }
};

const Ingredients = () => {
    // [] is the starting state of the userIngredients array, dispatch is the ingredientReducer function
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
    const { isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear } = useHttp();

    // useEffect gets executed right after every component render cycle
    // takes a function as first argument and an array of dependencies as second argument
    // if dependency array is empty useEffect acts like componentDidMount and runs only once after the first render
    useEffect(() => {
        if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
            dispatch({ type: 'DELETE', id: reqExtra });
        } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
            dispatch({
                type: 'ADD',
                ingredient: { id: data.name, ...reqExtra },
            });
        }
    }, [data, reqExtra, reqIdentifier, isLoading, error]);

    // useCallback "caches" the filteredIngredientsHandler function to stop re-rendering in Search.js
    // changes to onLoadIngredients which cause Ingredients to re-render do not recreate the filteredIngredientsHandler function
    const filteredIngredientsHandler = useCallback((filteredIngredients) => {
        //setUserIngredients(filteredIngredients);
        dispatch({ type: 'SET', ingredients: filteredIngredients });
    }, []); // empty useCallback dependency array

    const addIngredientHandler = useCallback((ingredient) => {
        sendRequest(
            'https://react-hooks-update-e681b-default-rtdb.firebaseio.com/ingredients.json',
            'POST',
            JSON.stringify(ingredient),
            ingredient,
            'ADD_INGREDIENT'
        );
    }, [sendRequest]);

    const removeIngredientHandler = useCallback(
        (ingredientId) => {
            sendRequest(
                `https://react-hooks-update-e681b-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
                'DELETE',
                null,
                ingredientId,
                'REMOVE_INGREDIENT'
            );
        },
        [sendRequest]
    );

    const ingredientList = useMemo(() => {
        return (
            <IngredientList
                ingredients={userIngredients}
                onRemoveItem={removeIngredientHandler}
            />
        );
    }, [userIngredients, removeIngredientHandler]);

    return (
        <div className="App">
            {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}

            <IngredientForm
                onAddIngredient={addIngredientHandler}
                loading={isLoading}
            />

            <section>
                //
                <Search onLoadIngredients={filteredIngredientsHandler} />
                {ingredientList}
            </section>
        </div>
    );
};

export default Ingredients;
