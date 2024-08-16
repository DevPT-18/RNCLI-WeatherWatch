import axios from 'axios';

export const fetchWeatherDetails = async (latitude: number, longitude: number) => {
    try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Oslo`);
        return response;
    } catch (err) {
        throw err;
    }
};

export const fetchAreaWeatherSearch = async (searchedValue: string) => {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${searchedValue}`;
        const response = await axios.get(url);
        return response.data.results;
    } catch (error) {
        throw error;
    }
};
