import React from "react";

interface Props {
  suggestion: string;
  onAdd: () => void;
  onClose: () => void;
}

const SuggestionPopup: React.FC<Props> = ({ suggestion, onAdd, onClose }) => {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 flex items-center gap-3 animate-slideUp">
        <div className="flex-1 text-sm text-gray-800 dark:text-gray-100">{suggestion}</div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onAdd}
          >
            Add
          </button>
          <button
            className="px-3 py-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionPopup;
