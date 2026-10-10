"""
test_endpoints.py — tests all API endpoints the /tools page calls.
Run: python test_endpoints.py
"""
import urllib.request, json, time, sys

BASE = 'http://127.0.0.1:8000'

def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f'{BASE}{path}', data=data,
        headers={'Content-Type': 'application/json'}, method='POST'
    )
    t0 = time.time()
    try:
        r = urllib.request.urlopen(req, timeout=10)
        ms = int((time.time() - t0) * 1000)
        return ms, json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        ms = int((time.time() - t0) * 1000)
        return ms, None, f'HTTP {e.code}: {e.read().decode()[:100]}'
    except Exception as e:
        ms = int((time.time() - t0) * 1000)
        return ms, None, str(e)[:80]

TESTS = [
    ('/api/iterative/nonlinear', {'fx':'x**3-2*x-5','method':'newton',    'x0':2,'tol':1e-8,'max_iter':50}),
    ('/api/iterative/nonlinear', {'fx':'x**3-2*x-5','method':'bisection', 'x0':2,'x1':3,'tol':1e-8,'max_iter':50}),
    ('/api/iterative/nonlinear', {'fx':'x**3-2*x-5','method':'fixedpoint','x0':2,'tol':1e-8,'max_iter':50}),
    ('/api/iterative/nonlinear', {'fx':'x**3-2*x-5','method':'secant',    'x0':2,'x1':3,'tol':1e-8,'max_iter':50}),
    ('/api/iterative/linear',    {'A':[[4,1,0],[1,3,1],[0,1,3]],'b':[1,2,3],'method':'jacobi',      'tol':1e-8,'max_iter':100}),
    ('/api/iterative/linear',    {'A':[[4,1,0],[1,3,1],[0,1,3]],'b':[1,2,3],'method':'gauss-seidel','tol':1e-8,'max_iter':100}),
    ('/api/integration',         {'fx':'x**2','a':0,'b':1,'n':8,'method':'trapezoidal'}),
    ('/api/integration',         {'fx':'x**2','a':0,'b':1,'n':8,'method':'simpson13'}),
    ('/api/integration',         {'fx':'x**2','a':0,'b':1,'n':8,'method':'simpson38'}),
    ('/api/ode',                 {'fxy':'x+y','x0':0,'y0':1,'x_end':2,'h':0.1,'method':'euler'}),
    ('/api/ode',                 {'fxy':'x+y','x0':0,'y0':1,'x_end':2,'h':0.1,'method':'rk4'}),
    ('/api/differentiation',     {'fx':'sin(x)','x0':1.0,'h':0.001,'method':'central'}),
    ('/api/differentiation',     {'fx':'sin(x)','x0':1.0,'h':0.001,'method':'forward'}),
    ('/matrix/determinant',      {'matrix':[[1,2],[3,4]]}),
    ('/matrix/inverse',          {'matrix':[[1,2],[3,4]]}),
    ('/system/solve',            {'matrix':[[2,1],[1,3]],'vector':[5,10],'method':'gauss'}),
    ('/system/solve',            {'matrix':[[2,1],[1,3]],'vector':[5,10],'method':'lu'}),
]

ok_count = 0
fail_count = 0

print(f"\n{'Endpoint + method':<42} {'ms':>6}  Status")
print('-' * 75)

for path, body in TESTS:
    method = body.get('method', '')
    label = f'{path} ({method})'
    ms, data, err = post(path, body)

    if err:
        fail_count += 1
        print(f'  FAIL  {label:<40} {ms:>5}ms  {err}')
    else:
        ok_count += 1
        # Build a compact summary of the result
        if data.get('root') is not None:
            detail = f'root={data["root"]:.6f}, iters={data.get("total_iterations","?")}'
        elif data.get('solution') and isinstance(data['solution'], list) and isinstance(data['solution'][0], (int,float)):
            sol = data['solution']
            detail = f'solution=[{", ".join(f"{v:.4f}" for v in sol[:4])}]'
        elif data.get('result') is not None and isinstance(data['result'], (int, float)):
            detail = f'result={data["result"]:.6f}'
        elif data.get('points'):
            detail = f'{len(data["points"])} ODE points'
        elif data.get('derivative') is not None:
            detail = f'derivative={data["derivative"]:.6f}'
        elif data.get('determinant') is not None:
            det = data['determinant']
            detail = f'det={det:.4f}' if isinstance(det, float) else f'det={det}'
        elif data.get('result') is not None:
            detail = f'result (matrix): {len(data["result"])}x{len(data["result"][0])}'
        else:
            detail = str(list(data.keys())[:4])
        print(f'  OK    {label:<40} {ms:>5}ms  {detail}')

print('-' * 75)
print(f'  PASSED {ok_count}/{ok_count+fail_count}    FAILED {fail_count}')
sys.exit(0 if fail_count == 0 else 1)
