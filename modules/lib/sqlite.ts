import * as SQLite from 'expo-sqlite';

export interface DbGetAll {
  fields?: string[],
  params?: any[],
  groupBy?: string,
  orderBy?: string,
  limit?: number,
  offset?: number
  callback?: (result: any[]) => void,
  debug?: 0 | 1
}

export interface DbGetRow {
  fields?: string[],
  id?: string | number,
  params?: any[],
  debug?: 0 | 1,
  callback?: (row: Object) => void
}

export interface DbDelete {
  fields?: string[],
  id?: string | number,
  params?: any[],
  debug?: 0 | 1,
  callback?: (rowsAffected: number) => void
}

export interface DbUpdate {
  values: Object,
  debug?: 0 | 1,
  callback?: (rowsAffected: number) => void,
  id?: string | number
}

export interface DbInsert {
  values: Object,
  debug?: 0 | 1,
  callback?: (insertId: number) => void,
}

export default class LibSQLite {

  table: string = 'esp'
  isDebug?: number
  db: any

  constructor() {

  }

  init(dbname?: string, createStatement?: string, version?: string, description?: string, size?: any): void {
    version = version ? version : '1';
    size = size ? size : '';
    if (dbname) {
      this.db = SQLite.openDatabase(dbname, version, description, size)
      this.table = dbname
    }
    if (createStatement) this.create(createStatement)
  }

  create(createStatement: string, debug?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.transaction((tx: any) => {
          tx.executeSql(createStatement, [], (transaction: any, result: any) => {
            resolve(result)
          }, (t: any, eror: any) => {
            reject(eror);
            if (debug == 1) this.configConsole('create() error => ' + t, eror)
          })
        })
      } else {
        if (debug == 1) this.configConsole('cant create table, db is null !')
      }
    })
  }

  drop(dbname: string, debug?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql("DROP TABLE IF EXISTS '" + dbname + "'", [], (transaction: any, result: any) => {
          resolve(result);
        }, (t: any, eror: any) => {
          reject(eror);
          if (debug == 1) this.configConsole('drop() error =>  ', t, eror);
        })
      })
    })
  }

  getColumn(): any[] {
    return []
  }

  execute(sqlStatement: string, callback?: (e: any) => void, debug?: number): Promise<any> {
    return new Promise((r: any, j) => {
      if (debug == 1)
        this.configConsole('execute() => ', sqlStatement)
      if (this.db) {
        if (this.db) {
          this.db.transaction((tx: any) => {
            if (Array.isArray(sqlStatement)) {
              var results: any[]
              var counter = sqlStatement.length
              sqlStatement.map((query) => {
                tx.executeSql(query, [], (transaction: any, result: any) => {
                  if (counter > 0) {
                    results.push(result);
                    counter--;
                  } else {
                    r(results);
                    if (callback) callback(results);
                  }
                }, (t: any, eror: any) => {
                  j(eror);
                  if (debug == 1)
                    this.configConsole("execute() error =>", query)
                })
              })
            } else {
              tx.executeSql(sqlStatement, [], (transaction: any, result: any) => {
                r(result);
                if (callback) callback(result);
              }, (t: any, eror: any) => {
                j(eror);
                if (debug == 1)
                  this.configConsole("execute() error =>", sqlStatement)
              })
            }
          })
        } else {
          if (debug == 1)
            this.configConsole('db is undefined')
        }
      }
    })
  }

  getSQLFormat(): string {
    var output = "";
    var fields = this.getColumn();
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      var addSQL = "TEXT";
      switch (field) {
        case "id":
          addSQL = "INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL";
          break;
        case "name":
        case "title":
        case "created":
        case "updated":
          addSQL = "VARCHAR";
          break;
        case "active":
        case "publish":
          addSQL = "INTEGER";
          break;
      }
      if (addSQL == "TEXT") {
        if ((/.*_id/g).test(field)) {
          addSQL = "INTEGER";
        }
      }
      output += "'" + field + "' " + addSQL + ",";
    }
    return output.substring(0, output.length - 2);
  }

  verify(values: any, debug?: number): any {
    if (values instanceof Object) {
      Object.keys(values).map((item) => {
        if (this.getColumn().indexOf(item) == -1) {
          delete values[item]
        }
      })
      var stringValues = JSON.stringify(values)
      stringValues = stringValues.replace(/'/g, "''")
      return JSON.parse(stringValues)
    } else {
      if (debug == 1)
        this.configConsole('values must be an object with key == fieldname')
    }
  }


  Insert_(options: DbInsert): Promise<any> {
    return new Promise((r, j) => {
      if (options) {
        var { values, debug, callback }: any = options
        if (values instanceof Object) {
          values = this.verify(values);
          var arValues = []
          var columnLength = this.getColumn().length
          for (let i = 0; i < columnLength; i++) {
            const field: string = this.getColumn()[i];
            if (field && field !== 'id') {
              arValues.push("'" + values[field] + "'");
            }
          }
          var query = 'INSERT INTO ' + this.table + ' (' + this.getColumn().splice(1, this.getColumn().length).join(',') + ') values (' + arValues.join(',') + ')'
          if (debug == 1) this.configConsole('Insert() => ' + query);
          this.db.transaction((tx: any) => {
            tx.executeSql(query, [], (transaction: any, result: any) => {
              r(result.insertId);
              if (callback) callback(result.insertId);
              if (debug == 1) this.configConsole('Insert ID => ' + result.insertId);
            }, (t: any, error: any) => {
              j(error)
              if (debug == 1) this.configConsole('Insert() error =>', error);
            })
          });
        } else {
          if (debug == 1) {
            this.configConsole('values must be an object with key == fieldname');
          }
        }
      }
    })
  }

  Insert(values: any, callback?: (insertId: number) => void, debug?: number): Promise<any> {
    return new Promise((r, j) => {
      if (values instanceof Object) {
        values = this.verify(values);
        var arValues = []
        var columnLength = this.getColumn().length
        for (let i = 0; i < columnLength; i++) {
          const field: string = this.getColumn()[i];
          if (field && field !== 'id') {
            arValues.push("'" + values[field] + "'");
          }
        }
        var query = 'INSERT INTO ' + this.table + ' (' + this.getColumn().splice(1, this.getColumn().length).join(',') + ') values (' + arValues.join(',') + ')'
        if (debug == 1) this.configConsole('Insert() => ' + query);
        this.db.transaction((tx: any) => {
          tx.executeSql(query, [], (transaction: any, result: any) => {
            r(result.insertId);
            if (callback) callback(result.insertId);
            if (debug == 1) this.configConsole('Insert ID => ' + result.insertId);
          }, (t: any, error: any) => {
            j(error)
            if (debug == 1) this.configConsole('Insert() error =>', error);
          })
        });
      } else {
        if (debug == 1) {
          this.configConsole('values must be an object with key == fieldname');
        }
      }
    })
  }

  Update_(options: DbUpdate): Promise<any> {
    return new Promise((r, j) => {
      if (options) {
        var { values, debug, callback, id }: any = options
        values = this.verify(values);
        var arValues: any = []
        Object.keys(values).map((key) => {
          arValues.push("" + key + "=" + "'" + values[key] + "'");
        })
        var statement = 'UPDATE ' + this.table + ' SET ' + arValues.join(', ') + ' WHERE ' + this.getColumn()[0] + '=' + id
        if (debug == 1) this.configConsole('Update() => ' + statement);
        this.db.transaction((tx: any) => {
          tx.executeSql(statement, [], (transaction: any, result: any) => {
            r(result.rowsAffected);
            if (debug == 1) this.configConsole('Update() => ' + result.rowsAffected);
            if (callback) callback(result.rowsAffected);
          }, (t: any, eror: any) => {
            j(eror);
            if (debug == 1) this.configConsole('Update error => ', t, eror);
          })
        })
      }
    })
  }

  Update(id: string | number, values: any, callback?: (rowsAffected: number) => void, debug?: number): Promise<any> {
    return new Promise((r, j) => {
      values = this.verify(values);
      var arValues: any = []
      Object.keys(values).map((key) => {
        arValues.push("" + key + "=" + "'" + values[key] + "'");
      })
      var statement = 'UPDATE ' + this.table + ' SET ' + arValues.join(', ') + ' WHERE ' + this.getColumn()[0] + '=' + id
      if (debug == 1) this.configConsole('Update() => ' + statement);
      this.db.transaction((tx: any) => {
        tx.executeSql(statement, [], (transaction: any, result: any) => {
          r(result.rowsAffected);
          if (debug == 1) this.configConsole('Update() => ' + result.rowsAffected);
          if (callback) callback(result.rowsAffected);
        }, (t: any, eror: any) => {
          j(eror);
          if (debug == 1) this.configConsole('Update error => ', t, eror);
        })
      })
    })
  }

  Delete_(options: DbDelete): Promise<any> {
    return new Promise((r, j) => {
      var query: string = '';
      if (options) {
        var { fields, id, params, debug, callback } = options
        if (id) {
          query = 'DELETE FROM ' + this.table + ' WHERE ' + this.getColumn()[0] + '=' + id;
        } else if (fields && params && fields.length == params.length) {
          var elmns = []
          for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            elmns.push(field + '=' + "'" + params[i] + "'")
          }
          query = 'DELETE FROM ' + this.table + ' WHERE ' + elmns.join(' AND ');
        } else {
          j('Not found id or field-params')
          return;
        }
        if (query) {
          try {
            this.db.transaction((tx: any) => {
              tx.executeSql(query, [], (transaction: any, result: any) => {
                r(result.rowsAffected);
                if (debug == 1) this.configConsole('Delete() => ' + result.rowsAffected);
                if (callback) callback(result.rowsAffected);
              }, (t: any, eror: any) => {
                j(eror);
                this.configConsole('Delete() error => ', t, eror);
              });
            })
          } catch (e) {
            if (debug == 1) this.configConsole(e)
          }
        }
      }
    })
  }

  Delete(id?: string | number, fields?: string[], params?: any[], callback?: (rowsAffected: number) => void, debug?: number): Promise<any> {
    return new Promise((r, j) => {
      var query: string = '';
      if (id) {
        query = 'DELETE FROM ' + this.table + ' WHERE ' + this.getColumn()[0] + '=' + id;
      } else if (fields && params && fields.length == params.length) {
        var elmns = []
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          elmns.push(field + '=' + "'" + params[i] + "'")
        }
        query = 'DELETE FROM ' + this.table + ' WHERE ' + elmns.join(' AND ');
      } else {
        j('Not found id or field-params')
        return;
      }
      if (query) {
        try {
          this.db.transaction((tx: any) => {
            tx.executeSql(query, [], (transaction: any, result: any) => {
              r(result.rowsAffected);
              if (debug == 1) this.configConsole('Delete() => ' + result.rowsAffected);
              if (callback) callback(result.rowsAffected);
            }, (t: any, eror: any) => {
              j(eror);
              this.configConsole('Delete() error => ', t, eror);
            });
          })
        } catch (e) {
          if (debug == 1) this.configConsole(e)
        }
      }
    })
  }

  getRow_(options: DbGetRow): Promise<any> {
    return new Promise((r, j) => {
      var query = ''
      if (options) {
        var { fields, id, params, debug, callback } = options
        if (id) {
          query = 'SELECT * FROM ' + this.table + ' WHERE ' + this.getColumn()[0] + '=' + id
        } else if (fields && params && fields.length == params.length) {
          var elmns = []
          for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            elmns.push(field + '=' + "'" + params[i] + "'")
          }
          query = 'SELECT * FROM ' + this.table + ' WHERE ' + elmns.join(' AND ')
        }
        if (query) {
          this.db.transaction((tx: any) => {
            tx.executeSql(query, [], (transaction: any, result: any) => {
              r(result.rows._array[0]);
              if (debug == 1) this.configConsole('getRow() => ', transaction, result.rows._array[0]);
              if (callback) callback(result.rows._array[0]);
            }, (t: any, eror: any) => {
              j(eror);
              this.configConsole('getRow() error => ', t, eror);
            })
          })
        }
      }
    })
  }

  getRow(id?: string | number, fields?: string[], params?: any[], callback?: (row: any) => void, debug?: number): Promise<any> {
    return new Promise((r, j) => {
      var query: string = ''
      if (id) {
        query = 'SELECT * FROM ' + this.table + ' WHERE ' + this.getColumn()[0] + '=' + id
      } else if (fields && params && fields.length == params.length) {
        var elmns = []
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          elmns.push(field + '=' + "'" + params[i] + "'")
        }
        query = 'SELECT * FROM ' + this.table + ' WHERE ' + elmns.join(' AND ')
      }
      if (query) {
        this.db.transaction((tx: any) => {
          tx.executeSql(query, [], (transaction: any, result: any) => {
            r(result.rows._array[0]);
            if (debug == 1) this.configConsole('getRow() => ', transaction, result.rows._array[0]);
            if (callback) callback(result.rows._array[0]);
          }, (t: any, eror: any) => {
            j(eror);
            this.configConsole('getRow() error => ', t, eror);
          })
        })
      }
    })
  }

  getAll_(options?: DbGetAll): Promise<any> {
    return new Promise((r, j) => {
      var query: string = 'SELECT * FROM ' + this.table + ' WHERE 1';
      if (options) {
        var { fields, params, groupBy, orderBy, limit, offset, callback, debug } = options
        if (fields && params && fields.length === params.length) {
          var elmns = []
          for (let i = 0; i < fields.length; i++) {
            const element = fields[i];
            elmns.push(element + '=' + "'" + params[i] + "'")
          }
          query = 'SELECT * FROM ' + this.table + ' WHERE ' + elmns.join(' AND ')
        }
        if (groupBy) {
          query += ' GROUP BY ' + groupBy;
        }
        if (orderBy) {
          query += ' ORDER BY ' + orderBy;
        }
        if (limit && limit > 0) {
          query += ' LIMIT ' + limit;
        }
        if (offset && offset > 0) {
          query += ' OFFSET ' + offset;
        }
      }
      this.db.transaction(async (tx: any) => {
        await tx.executeSql(query, [], async (transaction: any, result: any) => {
          r(result.rows._array);
          if (debug == 1) this.configConsole('getAll() => ', transaction, result.rows._array);
          if (callback) callback(result.rows._array);
        }, (t: any, eror: any) => {
          j(eror);
          this.configConsole('getAll() error => ', t, eror);
        })
      })
    })
  }


  getAll(fields?: string[], params?: any[], orderBy?: string, limit?: number, offset?: number, groupBy?: string, callback?: (data: any) => void, debug?: number): Promise<any> {
    return new Promise((r, j) => {
      var query: string = 'SELECT * FROM ' + this.table + ' WHERE 1';
      if (fields && params && fields.length === params.length) {
        var elmns = []
        for (let i = 0; i < fields.length; i++) {
          const element = fields[i];
          elmns.push(element + '=' + "'" + params[i] + "'")
        }
        query = 'SELECT * FROM ' + this.table + ' WHERE ' + elmns.join(' AND ')
      }
      if (groupBy) {
        query += ' GROUP BY ' + groupBy;
      }
      if (orderBy) {
        query += ' ORDER BY ' + orderBy;
      }
      if (limit && limit > 0) {
        query += ' LIMIT ' + limit;
      }
      if (offset && offset > 0) {
        query += ' OFFSET ' + offset;
      }
      this.db.transaction(async (tx: any) => {
        await tx.executeSql(query, [], async (transaction: any, result: any) => {
          r(result.rows._array);
          if (debug == 1) this.configConsole('getAll() => ', transaction, result.rows._array);
          if (callback) callback(result.rows._array);
        }, (t: any, eror: any) => {
          j(eror);
          this.configConsole('getAll() error => ', t, eror);
        })
      })
    })
  }

  configConsole(message?: any, ...optionalParams: any[]): void {
    if (this.isDebug === 1) {
      console.log(message, optionalParams);
    }
  }
}

// #sample


// import { LibSqlite } from 'esoftplay/cache/lib/sqlite/import';

// export default class enotification extends LibSqlite {
//   /* tablename */
//   static table = 'notification'

//   /* fieldname */
//   static id = 'id'
//   static notif_id = 'notif_id'
//   static user_id = "user_id"
//   static title = "title";
//   static message = "message";
//   static params = "params";
//   static return = "return";
//   static status = "status";
//   static created = "created";
//   static updated = "updated";

//   sql = "CREATE TABLE IF NOT EXISTS '" + enotification.table + "' (" + this.getSQLFormat() + ")"

//   constructor() {
//     super();
//     this.init(enotification.table, this.sql)
//   }

//   insertOrUpdate(notif: any): void {
//     notif['notif_id'] = notif.id
//     delete notif.id
//     this.getRow(undefined, [enotification.notif_id], [notif.notif_id], (res) => {
//       if (res) {
//         this.Update(res.id, notif)
//       } else {
//         this.Insert(notif)
//       }
//     })
//   }

//   setRead(id: number, status?: number): void {
//     if (!status) status = 2
//     this.Update(id, { [enotification.status]: status })
//   }

//   /* return fieldname */
//   getColumn(): string[] {
//     return [
//       enotification.id,
//       enotification.notif_id,
//       enotification.user_id,
//       enotification.title,
//       enotification.message,
//       enotification.params,
//       enotification.return,
//       enotification.status,
//       enotification.created,
//       enotification.updated,
//     ]
//   }
// }
