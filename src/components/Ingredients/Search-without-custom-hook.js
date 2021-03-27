import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo((props) => {
    // use object destructuring to get the onLoadIngredients function from props
    const { onLoadIngredients } = props;
    const [enteredFilter, setEnteredFilter] = useState('');
    // use useRef to set ref value on the Search input element
    const inputRef = useRef();

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
            fetch(
                'https://react-hooks-update-e681b-default-rtdb.firebaseio.com/ingredients.json' +
                    query
            )
                .then((response) => response.json())
                .then((responseData) => {
                    const loadedIngredients = [];
                    for (const key in responseData) {
                        loadedIngredients.push({
                            id: key,
                            title: responseData[key].title,
                            amount: responseData[key].amount,
                        });
                    }
                    // onLoadIngredients function is wrapped by useCallback in Ingredients.js to prevent infinite loop
                    onLoadIngredients(loadedIngredients);
                });
            }
        }, 500);
        // useEffect cleanup function to stop chaining unnecessary timers
        // if have empty dependency array, cleanup function runs when the component gets unmounted
        return () => {
            clearTimeout(timer);
        };
    }, [enteredFilter, onLoadIngredients, inputRef]); // array of useEffect dependencies

    return (
        <section className="search">
            <Card>
                <div className="search-input">
                    <label>Filter by Title</label>
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
