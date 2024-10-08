import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Select from 'react-tailwindcss-select';

document.title = '21BCE10310';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.baseURL = import.meta.env.VITE_APP_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [response, setResponse] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [apiError, setApiError] = useState('');

  const options = [
    { value: 'alphabets', label: 'Alphabets' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'highest_lowercase_alphabet', label: 'Highest Lowercase Alphabet' },
  ];

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const parsedJson = JSON.parse(data.jsonInput);

      if (!Array.isArray(parsedJson.data)) {
        throw new Error("Invalid input. Ensure 'data' is an array.");
      }

      const res = await axios.post('/bfhl', parsedJson);
      setResponse(res.data);
      reset();
    } catch (error) {
      console.error('Error:', error);
      setApiError(error.message || 'An error occurred');
    }
  };

  const handleSelectChange = (value) => {
    setSelectedOptions(value || []);
  };

  const renderResponse = () => {
    if (!response) return null;

    if (selectedOptions.length === 0) {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg">Response:</h3>
          <pre className="bg-gray-200 p-2 rounded">{JSON.stringify(response, null, 2)}</pre>
        </div>
      );
    }

    const filteredResponse = selectedOptions.reduce((acc, option) => {
      if (response[option.value]) {
        acc[option.label] = response[option.value];
      }
      return acc;
    }, {});

    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-lg">Response:</h3>
        <pre className="bg-gray-200 p-2 rounded">{JSON.stringify(filteredResponse, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset className='border-solid border-2 border-gray rounded-xl'>
          <legend className='ml-5 p-1'>API Input:</legend>
          <input
            type='text'
            className='p-3 rounded-lg bg-white w-full'
            {...register('jsonInput', {
              required: 'This field is required',
              validate: value => {
                try {
                  const parsed = JSON.parse(value);
                  if (!Array.isArray(parsed.data)) {
                    return "Invalid input. Ensure 'data' is an array.";
                  }
                  return true;
                } catch {
                  return 'Invalid JSON format';
                }
              }
            })}
            placeholder='{"data": ["A","C","z"]}'
            rows={4}
          />
          {errors.jsonInput && (
            <p className="text-red-500 text-sm">{errors.jsonInput.message}</p>
          )}
          {apiError && (
            <p className="text-red-500 text-sm">{apiError}</p>
          )}
        </fieldset>
        <button
          type="submit"
          className='px-4 py-2 bg-blue-500 text-white font-bold rounded w-full hover:bg-blue-600'>
          Submit
        </button>
      </form>

      {response && (
        <>
          <div className="mt-4">
            <fieldset className='border-solid border-2 border-gray rounded-xl'>
              <legend className='ml-5 p-1'>Multi Filter</legend>
            <Select
              isMultiple={true}
              value={selectedOptions}
              onChange={handleSelectChange}
              options={options}
              placeholder="Select options"
              classNames={{
                menuButton: ({ isDisabled }) =>
                  `flex text-sm text-left border-gray-300 focus:outline-none bg-white ${
                    isDisabled
                      ? 'opacity-50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200'
                  }`,
              }}
            />
            </fieldset>
          </div>
          {renderResponse()}
        </>
      )}
    </div>
  );
}

export default App;
