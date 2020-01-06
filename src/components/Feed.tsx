import React from 'react';
import { FakeRow } from '../providers/AppProvider';

interface Props {
  items: FakeRow[];
}

export const Feed: React.FunctionComponent<Props> = ({ items }) => {
  return (
    <React.Fragment>
      {items.map(({ avatar, country, name }) => (
        <div
          className="flex mx-4 mb-4 p-4 items-center bg-white rounded-xl"
          key={name}
        >
          <div className="flex-none mr-4">
            <img
              alt=""
              className="rounded-full"
              height="50"
              src={avatar}
              width="50"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-medium">{name}</h2>
            <p className="text-gray-500">{country}</p>
          </div>
        </div>
      ))}
    </React.Fragment>
  );
};
