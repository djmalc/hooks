import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';
import './Search.css';

const Search = React.memo((props) => {
    // use object destructuring to get the onLoadIngredients function from props
    const { onLoadIngredients } = props;
    const [enteredFilter, setEnteredFilter] = useState('');
    // use useRef to set ref value on the Search input element
    const inputRef = useRef();
    const { isLoading, data, error, sendRequest, clear } = useHttp();

    // useEffect gets executed right after every component render cycle
    // takes a function as first argument and an array of dependencies as second argument
    useEffect(() => {
        // set a timer (a closure) so fetch is not called on every Search keypress but only after a short pause
        const timer = setTimeout(() => {
            // enteredFilter will hold the value that existed when timer was set
            // inputRef will hold a reference to the current value after timeout has elapsed
            if (enteredFilter === inputRef.current.value) {
                const query =
                enteredFilter.length === 0
                    ? ''
                    : `?orderBy="title"&equalTo="${enteredFilter}"`;
                sendRequest('https://react-hooks-update-e681b-default-rtdb.firebaseio.com/ingredients.json' + query, 'GET');
 
                }
            
        }, 500);
        // useEffect cleanup function to stop chaining unnecessary timers
        // if have empty dependency array, cleanup function runs when the component gets unmounted
        return () => {
            clearTimeout(timer);
        };
    }, [enteredFilter, inputRef, sendRequest]); // array of useEffect dependencies

    // use useEffect to respond to data that is changed by the useHttp custom hook
    useEffect(() => {
        if (!isLoading && !error && data) {
            const loadedIngredients = [];
            for (const key in data) {
                loadedIngredients.push({
                    id: key,
                    title: data[key].title,
                    amount: data[key].amount,
                });
            }
            onLoadIngredients(loadedIngredients);
        }
    }, [data, isLoading, error, onLoadIngredients]);
    
    return (
        <section className="search">
            {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
            <Card>
                <div className="search-input">
                    <label>Filter by Title</label>
                    {isLoading && <span>Loading...</span>}
                    <input
                        ref={inputRef} //ref is a React property
                        type="text"
                        value={enteredFilter}
                        onChange={(event) =>
                            setEnteredFilter(event.target.value)
                        }
                    />
                </div>
            </Card>
        </section>
    );
});

export default Search;
