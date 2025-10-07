import React from "react";

interface Props {
  suggestion: string;
  onAdd: () => void;
  onClose: () => void;
}

const SuggestionPopup: React.FC<Props> = ({ suggestion, onAdd, onClose }) => {
  return (
    <div className="fixed inset-x-4 bottom-6 z-50 md:left-1/2 md:-translate-x-1/2 md:inset-x-auto">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
            {suggestion}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              onClick={onAdd}
            >
              Add
            </button>
            <button
              className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionPopup;
