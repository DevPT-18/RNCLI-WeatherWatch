import { render, waitFor, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { fetchAreaWeatherSearch, fetchWeatherDetails } from '../../api/API';
import getWeatherImage from '../../helpers/getWeatherImage';


jest.mock('../../api/API');  // Make sure the path is correct
jest.mock('../../helpers/getWeatherImage');

// Mock Data
const mockLocationResults = [
    { id: 1, name: 'Oslo', admin1: 'Oslo', admin2: 'Norway' },
    { id: 2, name: 'Berlin', admin1: 'Berlin', admin2: 'Germany' },
];

const mockWeatherData = {
    data: {
        daily: {
            time: ['2024-08-20', '2024-08-21'],
            temperature_2m_max: [20, 22],
            temperature_2m_min: [10, 12],
            weathercode: ['0', '2'],
        },
    },
};

describe('WeatherSearchScreen', () => {
    beforeEach(() => {
        (fetchAreaWeatherSearch as jest.Mock).mockResolvedValue(mockLocationResults);
        (fetchWeatherDetails as jest.Mock).mockResolvedValue(mockWeatherData);
        (getWeatherImage as jest.Mock).mockImplementation((code: string) => ({
            day: {
                description: code === '0' ? 'Sunny' : 'Partly Cloudy',
                image: `http://openweathermap.org/img/wn/${code === '0' ? '01d' : '02d'}@2x.png`,
            },
        }));
    });

    it('renders the search input and initial weather data', async () => {
        const { getByPlaceholderText, getByText } = render(<WeatherSearchScreen />);

        // Check that search input is rendered
        expect(getByPlaceholderText('Search location...')).toBeTruthy();

        // Wait for initial weather data to load
        await waitFor(() => {
            expect(getByText('Oslo')).toBeTruthy();
            expect(getByText('Sunny')).toBeTruthy();
            expect(getByText('15°C')).toBeTruthy(); // (20 + 10) / 2
        });
    });

    it('fetches and displays weather data based on search query', async () => {
        const { getByPlaceholderText, getByText, getAllByText } = render(<WeatherSearchScreen />);

        // Simulate typing a search query
        fireEvent.changeText(getByPlaceholderText('Search location...'), 'Berlin');

        // Wait for search results to load
        await waitFor(() => {
            expect(getAllByText('Berlin,Germany')).toHaveLength(1);
        });

        // Simulate selecting a location
        fireEvent.press(getByText('Berlin,Germany'));

        // Wait for weather data to load for the selected location
        await waitFor(() => {
            expect(getByText('Berlin')).toBeTruthy();
            expect(getByText('Partly Cloudy')).toBeTruthy();
            expect(getByText('17°C')).toBeTruthy(); // (22 + 12) / 2
        });
    });

    it('handles error when fetching weather data fails', async () => {
        (fetchWeatherDetails as jest.Mock).mockRejectedValueOnce(new Error('Failed to load weather data'));

        const { getByText } = render(<WeatherSearchScreen />);

        // Wait for error alert to be shown
        await waitFor(() => {
            expect(getByText('Error')).toBeTruthy();
            expect(getByText('Failed to load weather data')).toBeTruthy();
        });
    });

    it('hides dropdown if search query is less than 3 characters', async () => {
        const { getByPlaceholderText, queryByText } = render(<WeatherSearchScreen />);

        // Simulate typing a short search query
        fireEvent.changeText(getByPlaceholderText('Search location...'), 'Os');

        // Expect dropdown to be hidden
        expect(queryByText('Oslo,Norway')).toBeNull();
    });

    it('displays the correct weather image for different weather codes', async () => {
        const { getByText, getAllByRole } = render(<WeatherSearchScreen />);

        // Wait for initial weather data to load
        await waitFor(() => {
            expect(getByText('Sunny')).toBeTruthy();
            expect(getByText('Partly Cloudy')).toBeTruthy();
        });

        // Check that the correct images are displayed
        const images = getAllByRole('image');
        expect(images[0].props.source.uri).toBe('http://openweathermap.org/img/wn/01d@2x.png');
        expect(images[1].props.source.uri).toBe('http://openweathermap.org/img/wn/02d@2x.png');
    });
});
