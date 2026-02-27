import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Returns today's date as YYYY-MM-DD in local time (avoids UTC shift)
const todayLocal = () => new Date().toLocaleDateString("en-CA");

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const amountref = useRef(null);
  const descriptionref = useRef(null);
  const categoryref = useRef(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    (async () => {
      const [expenses, categories] = await Promise.all([
        axios.get(`${BASE_URL}/expenses`),
        axios.get(`${BASE_URL}/categories`)
      ]);
      setExpenses(expenses.data);
      setCategories(categories.data);
    })()
  }, []);

  const deleteExpenses = (id) => {
    axios.delete(`${BASE_URL}/expenses/${id}`);
    setExpenses(expenses.filter((expense) => expense.id !== id));
  }

  const addExpenses = async () => {
    const amount = amountref.current.value;
    const description = descriptionref.current.value;
    const category_id = categoryref.current.value;
    const date = selectedDate;

    try {
      const response = await axios.post(`${BASE_URL}/expenses`, {
        amount,
        description,
        category_id,
        date
      });

      console.log('responses', response.data);
      const savedDataformat = {
        amount : response.data.amount,
        category_name: categories.find(val => val.id === response.data.category_id).name,
        date: response.data.date,
        description: response.data.description,
        id: response.data.id
      }
      setExpenses([...expenses, savedDataformat]);
      // // Reset date back to today after save
      setSelectedDate(todayLocal());
    } catch (err) {
      console.error('Unable to save expense', err);
    }
  }

  return (
    <div className="bg-black h-[100vh] p-5 text-white">
      <h1 className="text-3xl text-center ">Expense Tracker</h1>
      <h1 className="text-5xl text-center py-5">₹ {expenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0).toFixed(2)}</h1>
      <div className="flex justify-center py-12">
        <table className="w-1/2 text-center">
          <thead>
            <tr className="border-b border-gray-200">
              <th>Categories</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              expenses.map((expense) => {
                return (
                  <tr key={expense.id}>
                    <td className="py-5" >{expense.category_name}</td>
                    <td className="py-5">{expense.description}</td>
                    <td>{expense.amount}</td>
                    <td>{expense.date ? expense.date.split('T')[0] : '—'}</td>
                    <td><button className="bg-red-500 px-2 py-1 rounded-md" onClick={() => deleteExpenses(expense.id)}>Delete</button></td>
                  </tr>
                )
              })
            }
            <tr>
              <td>
                <select ref={categoryref}>
                  {categories.map((category) => {
                    return (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    )
                  })}
                </select>
              </td>
              <td><input type="text" placeholder="Description" className="text-black border-1 outline-1 rounded-md bg-white px-2" ref={descriptionref}></input></td>
              <td className="py-5"><input type="number" placeholder="Amount" className="text-black border-1 outline-1 rounded-md bg-white px-2" ref={amountref}></input> </td>
              <td><input type="date" className="placeholder-white text-black border-1 border-white rounded-md w-full bg-white px-2" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}></input></td>
              <td><button className="bg-green-500 px-2 py-1 rounded-md w-full text-white" onClick={addExpenses}>Add</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
