export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}
export function formatTemp(celsiusValue, unit) {
  if (unit === "F") {
    return `${celsiusToFahrenheit(celsiusValue)}°F`;
  }
  return `${Math.round(celsiusValue)}°C`;
}
