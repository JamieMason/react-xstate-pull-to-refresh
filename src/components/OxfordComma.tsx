import React from 'react';

export const OxfordComma: React.FunctionComponent<{
  children: React.ReactNode[];
}> = ({ children }) => (
  <React.Fragment>
    {children.map((child, i) => {
      const size = children.length;
      const lastIndex = size - 1;
      const isLastItem = i === lastIndex;
      const separator = isLastItem ? '' : i < lastIndex - 1 ? ', ' : ' & ';
      return (
        <React.Fragment key={i}>
          {child}
          {separator}
        </React.Fragment>
      );
    })}
  </React.Fragment>
);
