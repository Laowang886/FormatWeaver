"use client";

import { useEffect, useState } from "react";
import EmptyHistory from "@/components/history/EmptyHistory";
import HistoryItem from "@/components/history/HistoryItem";
import {
  deleteHistoryRecord,
  fetchHistoryRecords,
  type HistoryRecord,
} from "@/lib/history";

export default function HistoryList() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void fetchHistoryRecords().then((historyRecords) => {
      if (isActive) setRecords(historyRecords);
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleDelete(recordId: string) {
    if (!window.confirm("Delete this conversion record?")) return;

    setDeletingId(recordId);

    try {
      await deleteHistoryRecord(recordId);
      setRecords((currentRecords) =>
        currentRecords.filter((record) => record.id !== recordId),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete conversion record.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (records.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <ul className="space-y-4">
      {records.map((record) => (
        <HistoryItem
          key={record.id}
          record={record}
          deleteDisabled={deletingId !== null}
          isDeleting={deletingId === record.id}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
