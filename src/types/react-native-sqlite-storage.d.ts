declare module 'react-native-sqlite-storage' {
  export interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (index: number) => any;
      raw: () => any[];
    };
  }

  export interface Transaction {
    executeSql: (
      sql: string,
      params?: any[],
      success?: (tx: Transaction, results: ResultSet) => void,
      error?: (tx: Transaction, error: any) => void
    ) => void;
  }

  export interface SQLiteDatabase {
    transaction: (
      fn: (tx: Transaction) => void,
      error?: (error: any) => void,
      success?: () => void
    ) => void;
    executeSql: (
      sql: string,
      params?: any[]
    ) => Promise<[ResultSet]>;
    close: (success?: () => void, error?: (error: any) => void) => void;
  }

  export interface DatabaseParams {
    name: string;
    location?: string;
  }

  namespace SQLite {
    export { SQLiteDatabase, DatabaseParams };
  }

  const SQLite: {
    openDatabase: (
      params: DatabaseParams,
      success?: (db: SQLiteDatabase) => void,
      error?: (error: any) => void
    ) => SQLiteDatabase;
    enablePromise: (enable: boolean) => void;
    SQLiteDatabase: SQLiteDatabase;
  };

  export default SQLite;
}
