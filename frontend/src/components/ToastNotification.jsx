export default function ToastNotification({ message }) {
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}
