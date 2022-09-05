import { useEffect, useState } from "react"

export function Async() {
  const [isButtonVisible, setIsButtonVisible] = useState(false)
  
  useEffect(() => {
    setTimeout(() => {
      setIsButtonVisible(true)
    }, 2000)
  })
  
  return (
    <div>
      <div>Hello World</div>
      {!isButtonVisible && <button>Button</button>}
    </div>
  )
}