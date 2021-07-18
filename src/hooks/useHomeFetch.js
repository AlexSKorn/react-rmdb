import { useState, useEffect, useRef } from "react";
import API from "../API";
import { isPersistedState } from "../helpers";
// this is how we create a custom hook
const initialState = {
  page: 0,
  results: [],
  total_pages: 0,
  total_results: 0,
};

export const useHomeFetch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchMovies = async (page, searchTerm = "") => {
    try {
      setError(false);
      setLoading(true);

      const movies = await API.fetchMovies(searchTerm, page);
      setState((prev) => ({
        ...movies,
        results:
          page > 1 ? [...prev.results, ...movies.results] : [...movies.results],
      }));
    } catch (error) {
      setError(true);
    }
    setLoading(false);
  };

  //when we specify the dependency array as an empty array the useEffect will only run once.
  //initial and search
  useEffect(() => {
    //dont check session storage if in a search
    if (!searchTerm) {
      const sessionState = isPersistedState("homeState");

      //check if we have something in the session storage and if we do grab it from the session storage
      if (sessionState) {
        setState(sessionState);
        return;
      }
    }

    setState(initialState);
    fetchMovies(1, searchTerm);
    console.log("initial");
  }, [searchTerm]);

  useEffect(() => {
    if (!isLoadingMore) return;

    fetchMovies(state.page + 1, searchTerm);
    setIsLoadingMore(false);
  }, [isLoadingMore, searchTerm, state.page]);

  //write to session sessionStorage
  useEffect(() => {
    if (!searchTerm) {
      sessionStorage.setItem("homeState", JSON.stringify(state));
    }
  }, [searchTerm, state]);

  // note we don't need to say state: state, loading: loading, error: error
  // because they all share the same name and this allows you to destructure like this
  return { state, loading, error, searchTerm, setSearchTerm, setIsLoadingMore };
};
