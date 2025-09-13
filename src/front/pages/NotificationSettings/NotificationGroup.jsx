import React from 'react';
import Button from '../../components/forms/Button';
import Checkbox from '../../components/forms/Checkbox';

const NotificationGroup = ({ title, description, preferences, fields, onToggle, onBulkToggle }) => {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200/80">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onBulkToggle(true)}
            className="!text-xs"
          >
            Enable All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onBulkToggle(false)}
            className="!text-xs"
          >
            Disable All
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map(field => (
          <Checkbox
            key={field.id}
            id={field.id}
            checked={preferences[field.id]}
            onChange={(value) => onToggle(field.id, value)}
            label={field.label}
            description={field.description}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationGroup;
