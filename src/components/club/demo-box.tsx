import React from "react";

interface DemoBoxProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function DemoBox({ title, description, icon: Icon }: DemoBoxProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-bryant-gray-300 bg-bryant-gray-50 px-6 py-8 text-center">
      {Icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bryant-gray-200">
          <Icon className="h-5 w-5 text-bryant-gray-500" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-bryant-gray-700">{title}</h3>
      <p className="mt-1 text-sm text-bryant-gray-500">{description}</p>
    </div>
  );
}
