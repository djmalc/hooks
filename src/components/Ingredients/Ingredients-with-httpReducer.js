import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

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

const httpReducer = (curHttpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null };
        case 'RESPONSE':
            return { ...curHttpState, loading: false };
        case 'ERROR':
            return { loading: false, error: action.errorMessage };
        case 'CLEAR':
            return { ...curHttpState, error: null };
        default:
            throw new Error('Should never get here!');
    }
};

const Ingredients = () => {
    // [] is the starting state of the userIngredients array, dispatch is the ingredientReducer function
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []);

    const [httpState, dispatchHttp] = useReducer(httpReducer, {
        Loading: false,
        error: null,
    });

    // useEffect gets executed right after every component render cycle
    // takes a function as first argument and an array of dependencies as second argument
    // if dependecy array is empty useEffect acts like componentDidMount and runs only once after the first render
    useEffect(() => {
        console.log('RENDERING INGREDIENTS', userIngredients);
    }, [userIngredients]);

    // useCallback "caches" the filteredIngrientsHandler function to stop re-rendering in Search.js
    // changes to onLoadIngredients which cause Ingredients to re-render do not recreate the filteredIngredientsHandler function
    const filteredIngredientsHandler = useCallback((filteredIngredients) => {
        //setUserIngredients(filteredIngredients);
        dispatch({ type: 'SET', ingredients: filteredIngredients });
    }, []); // empty useCallback dependency array

    const addIngredientHandler = useCallback((ingredient) => {
        dispatchHttp({ type: 'SEND' });
        fetch(
            'https://react-hooks-update-e681b-default-rtdb.firebaseio.com/ingredients.json',
            {
                method: 'POST',
                body: JSON.stringify(ingredient),
                headers: { 'Content-Type': 'application/json' },
            }
        )
            .then((response) => {
                dispatchHttp({ type: 'RESPONSE' });
                return response.json();
            })
            .then((responseData) => {
                dispatch({
                    type: 'ADD',
                    ingredient: { id: responseData.name, ...ingredient },
                });
            });
    }, []);

    const removeIngredientHandler = useCallback((ingredientId) => {
        //setIsLoading(true);
        dispatchHttp({ type: 'SEND' });
        fetch(
            `https://react-hooks-update-e681b-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
            // fake an error by mangling the url
            //`https://react-hooks-update-e681b-default-rtdb.firebaseio.com/ingredients/${ingredientId}.jon`,
            {
                method: 'DELETE',
            }
        )
            .then((response) => {
                dispatchHttp({ type: 'RESPONSE' });

                dispatch({ type: 'DELETE', id: ingredientId });
            })
            .catch((error) => {
                dispatchHttp({
                    type: 'ERROR',
                    errorMessage: 'Something went wrong!',
                });

            });
    }, []);

    const clearError = useCallback(() => {
        dispatchHttp({ type: 'CLEAR' });
        //setError(null);
    }, []);

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
            {httpState.error && (
                <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
            )}

            <IngredientForm
                onAddIngredient={addIngredientHandler}
                loading={httpState.loading}
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
