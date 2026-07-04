import { RouterProvider } from "react-router-dom"

import { appRoutes } from "@/routes/AppRoutes"

function App() {
  return <RouterProvider router={appRoutes} />
}

export default App
