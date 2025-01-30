import * as React from "react"

const Switch = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 bg-gray-200 data-[state=checked]:bg-blue-600" {...props} ref={ref}>
      <span
        className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 data-[state=checked]:translate-x-4`}
      />
    </div>
  )
})
Switch.displayName = "Switch"

export { Switch }