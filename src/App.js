import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const amountref = useRef(null);
  const descriptionref = useRef(null);
  const categoryref = useRef(null);

  console.log(expenses);
  console.log(categories);

  useEffect(() => {
    (async () => {
      const [expenses, categories] = await Promise.all([
        axios.get("http://localhost:5000/expenses"),
        axios.get("http://localhost:5000/categories")
      ]);
      setExpenses(expenses.data);
      setCategories(categories.data);
    })()
  }, []);

  const deleteExpenses = (id) => {
    axios.delete(`http://localhost:5000/expenses/${id}`);
    setExpenses(expenses.filter((expense) => expense.id !== id));
  }

  const addExpenses = async () => {
    const amount = amountref.current.value;
    const description = descriptionref.current.value;
    const category_id = categoryref.current.value;

    console.log(amount, description, category_id);
    try {
      await axios.post("http://localhost:5000/expenses", {
        amount,
        description,
        category_id
      });
      // Refetch expenses so the table shows the new row with category_name
      const updated = await axios.get("http://localhost:5000/expenses");
      setExpenses(updated.data);
    } catch (err) {
      console.error('Unable to save expense', err);
    }
  }

  return (
    <div className="bg-black h-[100vh] p-5 text-white">
      <h1 className="text-3xl text-center ">Expense Tracker</h1>
      <h1 className="text-5xl text-center py-5">{expenses.reduce((current, prev) => current + prev.amount, 0)}</h1>
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
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
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
              <td><input type="date" className="placeholder-white text-black border-1 border-white border-1 rounded-md w-full bg-white px-2" value={new Date().toISOString().split('T')[0]} disabled></input></td>
              <td><button className="bg-green-500 px-2 py-1 rounded-md w-full text-white" onClick={addExpenses}>Add</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
