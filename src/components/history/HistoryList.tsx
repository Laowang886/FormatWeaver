"use client";

import { useEffect, useState } from "react";
import EmptyHistory from "@/components/history/EmptyHistory";
import HistoryItem from "@/components/history/HistoryItem";
import { fetchHistoryRecords, type HistoryRecord } from "@/lib/history";

export default function HistoryList() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    let isActive = true;

    void fetchHistoryRecords().then((historyRecords) => {
      if (isActive) setRecords(historyRecords);
    });

    return () => {
      isActive = false;
    };
  }, []);

  if (records.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <ul className="space-y-4">
      {records.map((record) => (
        <HistoryItem key={record.id} record={record} />
      ))}
    </ul>
  );
}
