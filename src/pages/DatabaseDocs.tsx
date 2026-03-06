import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, FunctionSquare, HardDrive, Search, Table2, Shield, Key, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DB_TABLES, DB_FUNCTIONS, DB_STORAGE, DB_ENUM } from "@/data/dbSchema";

const commandColor: Record<string, string> = {
  SELECT: "bg-emerald-500/15 text-emerald-700 border-emerald-300",
  INSERT: "bg-blue-500/15 text-blue-700 border-blue-300",
  UPDATE: "bg-amber-500/15 text-amber-700 border-amber-300",
  DELETE: "bg-red-500/15 text-red-700 border-red-300",
};

const fnTypeColor: Record<string, string> = {
  rpc: "bg-violet-500/15 text-violet-700 border-violet-300",
  trigger: "bg-orange-500/15 text-orange-700 border-orange-300",
  utility: "bg-cyan-500/15 text-cyan-700 border-cyan-300",
};

const DatabaseDocs = () => {
  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    if (!search.trim()) return DB_TABLES;
    const q = search.toLowerCase();
    return DB_TABLES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.columns.some((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
    );
  }, [search]);

  const filteredFunctions = useMemo(() => {
    if (!search.trim()) return DB_FUNCTIONS;
    const q = search.toLowerCase();
    return DB_FUNCTIONS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
    );
  }, [search]);

  const totalColumns = DB_TABLES.reduce((acc, t) => acc + t.columns.length, 0);
  const totalPolicies = DB_TABLES.reduce((acc, t) => acc + t.rlsPolicies.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Trang chủ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Database Schema Docs</h1>
          </div>
          <Badge variant="outline" className="ml-auto text-xs font-mono">
            Cập nhật: 2026-03-06
          </Badge>
        </div>
      </header>

      <main className="container py-6 space-y-6 max-w-6xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Table2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{DB_TABLES.length}</p>
                <p className="text-xs text-muted-foreground">Bảng dữ liệu</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Key className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{totalColumns}</p>
                <p className="text-xs text-muted-foreground">Cột tổng cộng</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FunctionSquare className="h-8 w-8 text-violet-500" />
              <div>
                <p className="text-2xl font-bold">{DB_FUNCTIONS.length}</p>
                <p className="text-xs text-muted-foreground">Functions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{totalPolicies}</p>
                <p className="text-xs text-muted-foreground">RLS Policies</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm bảng, cột, function..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tables">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="tables" className="gap-1.5">
              <Table2 className="h-3.5 w-3.5" />
              Bảng ({filteredTables.length})
            </TabsTrigger>
            <TabsTrigger value="functions" className="gap-1.5">
              <FunctionSquare className="h-3.5 w-3.5" />
              Functions ({filteredFunctions.length})
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              Storage ({DB_STORAGE.length})
            </TabsTrigger>
          </TabsList>

          {/* Tables Tab */}
          <TabsContent value="tables">
            <Accordion type="multiple" className="space-y-2">
              {filteredTables.map((table) => (
                <AccordionItem key={table.name} value={table.name} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge variant="outline" className="font-mono text-xs shrink-0">
                        {table.columns.length} cols
                      </Badge>
                      <div>
                        <span className="font-mono font-semibold">{table.name}</span>
                        <p className="text-xs text-muted-foreground font-normal mt-0.5">{table.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {/* Columns */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5" /> Columns
                      </h4>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Tên</TableHead>
                              <TableHead>Kiểu</TableHead>
                              <TableHead className="w-[80px]">Nullable</TableHead>
                              <TableHead>Default</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {table.columns.map((col) => (
                              <TableRow key={col.name}>
                                <TableCell className="font-mono text-xs">
                                  {col.isPrimaryKey && <span className="text-amber-500 mr-1">🔑</span>}
                                  {col.name}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="font-mono text-[10px]">
                                    {col.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {col.nullable ? (
                                    <span className="text-muted-foreground text-xs">YES</span>
                                  ) : (
                                    <span className="text-xs font-medium">NOT NULL</span>
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {col.default ?? "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Foreign Keys */}
                    {table.foreignKeys.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                          <ChevronRight className="h-3.5 w-3.5" /> Foreign Keys
                        </h4>
                        <div className="space-y-1">
                          {table.foreignKeys.map((fk) => (
                            <div key={fk.column} className="text-xs font-mono bg-muted/50 rounded px-3 py-1.5">
                              {table.name}.<span className="text-primary">{fk.column}</span>
                              {" → "}
                              {fk.referencedTable}.<span className="text-primary">{fk.referencedColumn}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RLS Policies */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" /> RLS Policies ({table.rlsPolicies.length})
                      </h4>
                      <div className="space-y-1.5">
                        {table.rlsPolicies.map((policy, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs bg-muted/30 rounded px-3 py-2">
                            <Badge className={`${commandColor[policy.command]} text-[10px] shrink-0 mt-0.5`}>
                              {policy.command}
                            </Badge>
                            <div>
                              <span className="font-medium">{policy.name}</span>
                              {policy.using && (
                                <p className="text-muted-foreground font-mono mt-0.5">USING: {policy.using}</p>
                              )}
                              {policy.withCheck && (
                                <p className="text-muted-foreground font-mono mt-0.5">CHECK: {policy.withCheck}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disabled Actions */}
                    {table.disabledActions.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>🚫 Không cho phép:</span>
                        {table.disabledActions.map((a) => (
                          <Badge key={a} variant="outline" className="text-[10px] text-destructive border-destructive/30">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Functions Tab */}
          <TabsContent value="functions">
            <div className="space-y-2">
              {filteredFunctions.map((fn) => (
                <Card key={fn.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge className={`${fnTypeColor[fn.type]} text-[10px] shrink-0 mt-0.5`}>
                        {fn.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-semibold text-sm">{fn.name}({fn.args})</p>
                        <p className="text-xs text-muted-foreground mt-1">→ {fn.returns}</p>
                        <p className="text-sm mt-2">{fn.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage">
            <div className="space-y-2">
              {DB_STORAGE.map((bucket) => (
                <Card key={bucket.name}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <HardDrive className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-mono font-semibold">{bucket.name}</p>
                      <p className="text-sm text-muted-foreground">{bucket.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {bucket.isPublic ? "Public" : "Private"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}

              {/* Enum */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Enums</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(DB_ENUM).map(([name, values]) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{name}:</span>
                      {values.map((v) => (
                        <Badge key={v} variant="secondary" className="font-mono text-xs">{v}</Badge>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DatabaseDocs;
