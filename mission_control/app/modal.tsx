export default function Modal({
  setModalOpen,
  handleSubmit,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
}) {
  return (
    <div
      className="fixed left-0 top-0 z-[99999] grid h-screen w-full place-items-center bg-black bg-opacity-50"
      onClick={() => setModalOpen(false)}
    >
      <div className="rounded-lg bg-white p-4 text-black shadow-lg">
        <h1 className="mb-4">Are you sure you want to clear all data?</h1>
        <div className="grid w-full grid-cols-2 gap-x-4">
          <button
            className="rounded-lg bg-red-500 p-2 text-white"
            onClick={() => setModalOpen(false)}
          >
            No
          </button>
          <button
            className="rounded-lg bg-green-500 p-2 text-white"
            onClick={handleSubmit}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
