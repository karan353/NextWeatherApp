import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, MenuItem, Select, ButtonBase, Grid, Paper, Typography } from "@mui/material";

import axios from "axios";

// Array made to change numerical data (coming from (new Date(temp.time)).getDay()) to days of the week
const days = ["Monday", 'Tuesday', "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const locations = [
  {
    name: "Niagara Falls",
    lat: 43.12806722816226,
    lng: -79.20240935773508,
  },
  {
    name: "Toronto",
    lat: 43.64236431420935,
    lng: -79.38719627675631,
  },
  {
    name: "New York City",
    lat: 40.690014093098746,
    lng: -74.04570206886868,
  },
  {
    name: "Ottawa",
    lat: 45.424916003892974,
    lng: -75.70012873480708,
  },
  {
    name: "Beijing",
    lat: 39.9055882409151,
    lng: 116.39718108693825,
  },
  {
    name: "Amsterdam",
    lat: 52.35779405729731,
    lng: 4.891692545476671,
  },
];

export default function Location({ onChange, style, ...props }) {
  const [value, setValue] = useState(locations[0]);
  const [weatherData, setWeatherData] = useState([]);
  const [selected, setSelected] = useState(0);
  const [dailyUnits, setDailyUnits] = useState({});
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (typeof onChange === "function") onChange(value);

    axios
      .get(
        `https://api.open-meteo.com/v1/forecast?timezone=EST&latitude=${value.lat}&longitude=${value.lng}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,rain_sum,snowfall_sum`
      )
      .then((response) => {
        const daily = response.data.daily;

        setDailyUnits(response.data.daily_units);

        const temperaturesByTime = [];
        [0, 1, 2, 3, 4, 5, 6].forEach((day) => {
          temperaturesByTime.push({
            time: daily.time[day],
            max: daily.temperature_2m_max[day],
            min: daily.temperature_2m_min[day],
            apparent_temperature_max: daily.apparent_temperature_max[day],
            apparent_temperature_min: daily.apparent_temperature_min[day],
            rain_sum: daily.rain_sum[day],
            snowfall_sum: daily.snowfall_sum[day],
          });
        });

        setWeatherData(temperaturesByTime);
      });
  }, [value]);

  return (
    <Grid
    container
  >
    <FormControl fullWidth style={{ margin: "1em 0", ...style }}>
      <InputLabel id="location-select-label">Location</InputLabel>
      <Select
        labelId="location-select-label"
        id="location-select"
        label="Location"
        value={value}
        onChange={handleChange}
      >
        {locations.map((location) => (
          <MenuItem key={`key-${location.name}`} value={location}>
            {location.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {weatherData.length > 0 && (
      <Grid container>
        {weatherData.map((weather, idx) => (
          <Grid key={`day-${idx}`} spacing={10}>
            <ButtonBase onClick={() => setSelected(idx)}>
              <Paper
                style={{
                  padding: "20px",
                  margin: "1rem",
                  backgroundColor: idx === selected && "lightgray",
                }}
              >
                <Typography>
                  {days[new Date(weather.time).getDay()]}
                </Typography>
                <Typography>
                  {weather.max}
                  {dailyUnits.temperature_2m_max}
                </Typography>
                <Typography>
                  {weather.min}
                  {dailyUnits.temperature_2m_min}
                </Typography>
              </Paper>
            </ButtonBase>
          </Grid>
        ))}

        {weatherData.length > 0 && (
          <Grid>
            <Typography>
              Feels like {weatherData[selected].apparent_temperature_max}
              {dailyUnits.apparent_temperature_max} -  <br/>
              {weatherData[selected].apparent_temperature_min}
              {dailyUnits.apparent_temperature_min}
            </Typography>
            <Typography>
              It will rain {weatherData[selected].rain_sum}
              {dailyUnits.rain_sum}
            </Typography>
            <Typography>
              It will snow {weatherData[selected].snowfall_sum}
              {dailyUnits.snowfall_sum}
            </Typography>
          </Grid>
        )}
      </Grid>
    )}
  </Grid>
  );
}

Location.propTypes = {
  onChange: PropTypes.func,
};


