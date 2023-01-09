import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router-dom";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext)
export const useSetCurrentUser = () => useContext(SetCurrentUserContext)

export const CurrentUserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const history = useHistory();

    const handleMount = async () => {
        try {
            const { data } = await axiosRes.get('dj-rest-auth/user/')
            // axios response has been applied to the above
            // make note that it was originally just 'axios'
            setCurrentUser(data)
        } catch (err) {
            // console.log(err)
        }
    }

    useEffect(() => {
        handleMount()
    }, [])

    useMemo(() => {

        // Set axios request to always refresh 
        // access_token before making a request
        axiosReq.interceptors.request.use(
            async (config) => {
                if (shouldRefreshToken()) {
                    try {
                        await axios.post("/dj-rest-auth/token/refresh/")
                    } catch (err) {
                        setCurrentUser((prevCurrentUser) => {
                            if (prevCurrentUser) {
                                history.push("/signin")
                            }
                            return null
                        })
                        removeTokenTimestamp()
                        return config
                    }
                }
                return config
            },
            (err) => {
                return Promise.reject(err);
            }
        )

        // Set axios response to refresh 
        // access_token if it gets a 401 error

        // We then added axiosRes to what was originally
        // just 'axios' in the handleMount function
        axiosRes.interceptors.response.use(
            (response) => response,
            async (err) => {
                if (err.response?.status === 401) {
                    try {
                        await axios.post("/dj-rest-auth/token/refresh/")
                    } catch (err) {
                        setCurrentUser(prevCurrentUser => {
                            if (prevCurrentUser) {
                                history.push("/signin")
                            }
                            return null
                        });
                        removeTokenTimestamp()
                    }
                    return axios(err.config)
                }
                return Promise.reject(err)
            }
        )
    }, [history])

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <SetCurrentUserContext.Provider value={setCurrentUser}>
                {children}
            </SetCurrentUserContext.Provider>
        </CurrentUserContext.Provider>
    )
}